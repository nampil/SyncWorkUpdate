import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '~/plugins/firebase'

export async function add_jobTask(
  { dispatch, rootState },
  { order, jobTasksToSend, jobType, notifyContractors, contractors }
) {
  const orderId = order.id
  const orderRef = doc(db, 'orders', orderId)
  const user = rootState.auth.user.profile

  // eslint-disable-next-line
  console.log(
    'order, jobTasksToSend, jobType, notifyContractors, contractors',
    order,
    jobTasksToSend,
    jobType,
    notifyContractors,
    contractors
  )

  const batch = writeBatch(db)

  for (let j = 0; j < jobTasksToSend.length; j++) {
    const jobTasksRef = doc(collection(orderRef, jobType))
    const _jobTask = jobTasksToSend[j]
    const { files, requirements, materialsOrTools, pictures, ...objToSend } =
      _jobTask
    let _pictures = []

    // if (pictures && pictures.length) {
    //   for (let idx = 0; idx < pictures.length; idx++) {
    //     const pic = pictures[idx]

    //     const oldRef = ref(storage, pic.url)

    //     const file = await getBlob(oldRef)

    //     const newRef = ref(
    //       storage,
    //       `orders/${orderId}/${jobType}/${jobTasksRef.id}/${pic.codeName}`
    //     )

    //     await uploadBytes(newRef, file)
    //     const url = await getDownloadURL(newRef)

    //     _pictures.push({
    //       ...pic,
    //       url,
    //     })
    //   }
    // }

    if (files && files.length > 0) {
      const urls = await dispatch('upload_pic_for_tasks', {
        files: _jobTask.files,
        orderId,
        jobType,
        taskId: jobTasksRef.id,
      })
      _pictures = urls
    }

    if (pictures?.length) {
      for (let i = 0; i < pictures.length; i++) {
        const _pic = pictures[i]

        if (!_pictures.map((p) => p.codeName).includes(_pic.codeName)) {
          _pictures.push(_pic)
        }
      }
    }

    if (requirements && requirements.length) {
      for (let i = 0; i < requirements.length; i++) {
        const { isDuplicated, originReqId, ...requirement } = requirements[i]
        const refRequirement = doc(
          collection(
            db,
            `orders/${orderId}/${jobType}/${jobTasksRef.id}/requirements`
          )
        )

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

        batch.set(refRequirement, newRequirement)
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
