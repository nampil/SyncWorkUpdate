import { doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_order_template({ dispatch }, { objectDelete }) {
  const _tasks = await dispatch('get_taskOrdersTemplates', {
    orderId: objectDelete.id,
  })
  const batch = writeBatch(db)

  const allTasks = [
    ..._tasks.allowablesPools,
    ..._tasks.workToDos,
    ..._tasks.inspections,
  ]

  for (let i = 0; i < allTasks.length; i++) {
    const task = allTasks[i]

    /* ELimina requeriments */
    if (task.requirements?.length) {
      for (let r = 0; r < task.requirements.length; r++) {
        const requirement = task.requirements[r]

        if (requirement.pictures && requirement.pictures.length) {
          // Delete Pictures in store

          await dispatch('delete_pic_for_requirements', {
            picsToDelete: requirement.pictures,
            orderId: objectDelete.id,
            jobType: task.type,
            taskId: task.id,
            requirementId: requirement.id,
          })
        }

        const reqRef = doc(
          db,
          `admin/config/orders-templates/${objectDelete.id}/${task.type}/${task.id}/requirements`,
          requirement.id
        )
        batch.delete(reqRef)
      }
    }

    /* Elimina Materiales */
    if (task.materialsOrTools?.length) {
      for (let m = 0; m < task.materialsOrTools.length; m++) {
        const material = task.materialsOrTools[m]
        const materialRef = doc(
          db,
          `admin/config/orders-templates/${objectDelete.id}/${task.type}/${task.id}/materialsOrTools`,
          material.id
        )
        batch.delete(materialRef)
      }
    }

    // Delete Pictures in store
    if (task.pictures && task.pictures.length) {
      await dispatch('delete_pic_for_task', {
        picsToDelete: task.pictures,
        orderId: objectDelete.id,
        jobType: task.type,
        taskId: task.id,
      })
    }

    const taskRef = doc(
      db,
      `admin/config/orders-templates/${objectDelete.id}/${task.type}`,
      task.id
    )
    batch.delete(taskRef)
  }
  const templatesRefOrder = doc(
    db,
    'admin/config/orders-templates',
    objectDelete.id
  )
  batch.delete(templatesRefOrder)

  await batch.commit()
}
