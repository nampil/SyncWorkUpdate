import { doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_task({ dispatch }, { orderId, jobTask }) {
  const batch = writeBatch(db)

  /* Eliminar Storage de los requeriemintos */
  if (jobTask.requirements && jobTask.requirements.length) {
    for (let i = 0; i < jobTask.requirements.length; i++) {
      const requirement = jobTask.requirements[i]

      if (requirement.pictures && requirement.pictures.length) {
        // Delete Pictures in store

        await dispatch('delete_pic_for_requirements', {
          picsToDelete: requirement.pictures,
          orderId,
          jobType: jobTask.type,
          taskId: jobTask.id,
          requirementId: requirement.id,
        })
      }
      const reqRef = doc(
        db,
        `admin/config/orders-templates/${orderId}/${jobTask.type}/${jobTask.id}/requirements`,
        requirement.id
      )
      batch.delete(reqRef)
    }
  }

  if (jobTask.materialsOrTools?.length) {
    for (let m = 0; m < jobTask.materialsOrTools.length; m++) {
      const material = jobTask.materialsOrTools[m]
      const materialRef = doc(
        db,
        `admin/config/orders-templates/${orderId}/${jobTask.type}/${jobTask.id}/materialsOrTools`,
        material.id
      )
      batch.delete(materialRef)
    }
  }

  if (jobTask.pictures && jobTask.pictures.length) {
    await dispatch('delete_pic_for_task', {
      picsToDelete: jobTask.pictures,
      orderId,
      jobType: jobTask.type,
      taskId: jobTask.id,
    })
  }

  const taskRef = doc(
    db,
    `admin/config/orders-templates/${orderId}/${jobTask.type}`,
    jobTask.id
  )
  batch.delete(taskRef)

  await batch.commit()
  return ''
}
