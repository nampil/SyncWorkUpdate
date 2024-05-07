import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '~/plugins/firebase'

export async function add_jobTasks(
  { dispatch, rootState },
  { jobTasksToSend, order, notifyContractors, contractors }
) {
  const orderId = order.id
  const orderRef = doc(db, 'orders', orderId)
  const user = rootState.auth.user.profile

  const batch = writeBatch(db)

  for (let j = 0; j < jobTasksToSend.length; j++) {
    const _jobTask = jobTasksToSend[j]
    const jobType = _jobTask.type
    const jobTasksRef = doc(collection(orderRef, jobType))

    const { files, requirements, materialsOrTools, pictures, ...objToSend } =
      _jobTask
    let _pictures = []

    if (pictures && pictures.length) {
      for (let idx = 0; idx < pictures.length; idx++) {
        const pic = pictures[idx]
        const oldRef = ref(storage, pic.url)
        const file = await getBlob(oldRef)
        const newRef = ref(
          storage,
          `orders/${orderId}/${jobType}/${jobTasksRef.id}/${pic.codeName}`
        )

        await uploadBytes(newRef, file)
        const url = await getDownloadURL(newRef)

        _pictures.push({
          ...pic,
          url,
        })
      }
    }

    if (files && files.length > 0) {
      const urls = await dispatch('upload_pic_for_tasks', {
        files: _jobTask.files,
        orderId,
        jobType,
        taskId: jobTasksRef.id,
      })
      _pictures = urls
    }

    if (requirements && requirements.length) {
      for (let i = 0; i < requirements.length; i++) {
        const { isDuplicated, originReqId, pictures, ...requirement } =
          requirements[i]
        const refRequirement = doc(
          collection(
            db,
            `orders/${orderId}/${jobType}/${jobTasksRef.id}/requirements`
          )
        )
        const _picturesReq = []
        if (pictures && pictures.length) {
          for (let idx = 0; idx < pictures.length; idx++) {
            const pic = pictures[idx]
            const oldRef = ref(storage, pic.url)
            const file = await getBlob(oldRef)
            const newRef = ref(
              storage,

              `orders/${orderId}/${jobType}/${jobTasksRef.id}/requirements/${refRequirement.id}/${pic.codeName}`
            )

            await uploadBytes(newRef, file)
            const url = await getDownloadURL(newRef)
            _picturesReq.push({
              ...pic,
              url,
            })
          }
        }

        // requirement.pictures = _picturesReq
        if (requirement.files && requirement.files.length > 0) {
          const urls = await dispatch('upload_pic_for_requirements', {
            files: requirement.files,
            orderId,
            type: jobType,
            taskId: jobTasksRef.id,
            requirementId: refRequirement.id,
          })

          requirement.pictures = urls
        }
        const { files, id, ...newRequirement } = requirement

        // console.log('newR', newRequirement)

        batch.set(refRequirement, {
          ...newRequirement,
          pictures: _picturesReq,
        })
      }
    }
    if (materialsOrTools && materialsOrTools.length) {
      for (let i = 0; i < materialsOrTools.length; i++) {
        const material = materialsOrTools[i]
        const refMaterialsOrTools = doc(
          collection(
            db,
            `orders/${orderId}/${jobType}/${jobTasksRef.id}/materialsOrTools`
          )
        )
        const { id, ...newMaterial } = material
        batch.set(refMaterialsOrTools, newMaterial)
      }
    }

    // batch, estoy permite hacer un lote de llamadas
    batch.set(jobTasksRef, {
      ...objToSend,
      pictures: _pictures,
      updatedBy: user,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      createdBy: user,
      status: 'idle',
    })

    if (notifyContractors && contractors.length) {
      const users = contractors
      const message = {
        title: `New Task`,
        body: `There is a new task in order ${order.woNumber}: ${_jobTask.title}`,
      }
      const msgType = 'NEW_TASK'
      const link = `${orderId}-${order.woNumber}-${jobType}-${jobTasksRef.id}`

      const objectToSend = {
        users,
        message,
        type: msgType,
        link,
        sendMessageInApp: false,
      }

      this.$notifyUsers(objectToSend)
    }
  }
  await batch.commit()

  return ''
}
