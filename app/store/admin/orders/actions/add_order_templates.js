import { collection, doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_order_templates({ dispatch }, { objectToSend }) {
  const orderRef = doc(collection(db, 'admin/config/orders-templates'))
  const batch = writeBatch(db)

  batch.set(orderRef, {
    title: objectToSend.title,
    loanTypes: objectToSend.loanTypes,
    client: objectToSend.client,
    active: objectToSend.active,
    customers: objectToSend.customers,
  })

  for (let j = 0; j < objectToSend.tasks.length; j++) {
    const _jobTask = objectToSend.tasks[j]
    const jobTasksRef = doc(collection(orderRef, _jobTask.type))

    const { files, requirements, materialsOrTools, pictures, ...objToSend } =
      _jobTask
    let _pictures = []
    if (files && files.length > 0) {
      const urls = await dispatch('upload_pic_for_order_tasks', {
        files: _jobTask.files,
        taskId: jobTasksRef.id,
        orderId: orderRef.id,
        jobType: _jobTask.type,
      })
      _pictures = urls
    }

    if (requirements && requirements.length) {
      for (let i = 0; i < requirements.length; i++) {
        const { isDuplicated, originReqId, ...requirement } = requirements[i]
        const refRequirement = doc(
          collection(
            db,

            `admin/config/orders-templates/${orderRef.id}/${_jobTask.type}/${jobTasksRef.id}/requirements`
          )
        )

        if (requirement.files && requirement.files.length > 0) {
          const urls = await dispatch(
            'upload_pic_for_order_task_requirements',
            {
              files: requirement.files,
              orderId: orderRef.id,
              jobType: _jobTask.type,
              taskId: jobTasksRef.id,
              requirementId: refRequirement.id,
            }
          )

          requirement.pictures = urls
        }
        const { files, id, ...newRequirement } = requirement

        batch.set(refRequirement, newRequirement)
      }
    }
    if (materialsOrTools && materialsOrTools.length) {
      for (let i = 0; i < materialsOrTools.length; i++) {
        const material = materialsOrTools[i]
        const refMaterialsOrTools = doc(
          collection(
            db,
            `admin/config/orders-templates/${orderRef.id}/${_jobTask.type}/${jobTasksRef.id}/materialsOrTools`
          )
        )
        const { id, ...newMaterial } = material
        batch.set(refMaterialsOrTools, newMaterial)
      }
    }

    batch.set(jobTasksRef, {
      ...objToSend,
      pictures: _pictures,
      status: 'Inactive',
    })
  }
  await batch.commit()

  return ''
}
