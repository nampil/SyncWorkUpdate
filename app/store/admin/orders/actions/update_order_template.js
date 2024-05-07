import { collection, doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_order_template({ dispatch }, { objectToSend }) {
  const orderRef = doc(
    db,
    'admin/config/orders-templates',
    objectToSend.orderId
  )

  const batch = writeBatch(db)

  batch.update(orderRef, {
    title: objectToSend.title,
    loanTypes: objectToSend.loanTypes,
    client: objectToSend.client,
    active: objectToSend.active,
    customers: objectToSend.customers,
  })

  for (let j = 0; j < objectToSend.newTasks.length; j++) {
    const _jobTask = objectToSend.newTasks[j]
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
      status: 'idle',
    })
  }
  await batch.commit()

  for (let i = 0; i < objectToSend.updateTasks.length; i++) {
    const task = objectToSend.updateTasks[i]

    const idx = objectToSend.baseJobTasks.map((pic) => pic.id).indexOf(task.id)

    dispatch('update_task', {
      jobTaskToSend: task,
      orderId: objectToSend.orderId,
      jobType: task.type,
      baseJobTask: objectToSend.baseJobTasks[idx],
    })
  }

  for (let i = 0; i < objectToSend.deleteTasks.length; i++) {
    const task = objectToSend.deleteTasks[i]

    dispatch('delete_task', {
      jobTask: task,
      orderId: objectToSend.orderId,
    })
  }
}
