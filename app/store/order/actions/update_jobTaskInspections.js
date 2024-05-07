import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_jobTaskInspections(
  { rootState, dispatch },
  { inspections, orderId, jobType }
) {
  const user = rootState.auth.user.profile
  const orderRef = doc(db, 'orders', orderId)
  const batch = writeBatch(db)
  for (let i = 0; i < inspections.length; i++) {
    const inspection = inspections[i]
    const jobTaskRef = doc(collection(orderRef, jobType), inspection.id)

    batch.update(jobTaskRef, {
      areasInReports: inspection.subAreas.map((sub) => sub.title),
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })

    /* Delete storage requirements pic */
    if (inspection.requirementsDelete) {
      for (let i = 0; i < inspection.requirementsDelete.length; i++) {
        let picsToDelete = []
        const req = inspection.requirementsDelete[i]
        if (req.pictures && req.pictures.length) {
          picsToDelete = picsToDelete.concat(req.pictures)
        }

        if (picsToDelete && picsToDelete.length) {
          await dispatch('remove_pic_for_requirement', {
            picsToDelete,
            orderId,
            type: 'inspections',
            taskId: inspection.id,
            requirementId: req.id,
          })
        }
      }
    }
    if (inspection.requirementsUpdate || inspection.requirementsDelete) {
      dispatch('update_requirements', {
        requirements: inspection.requirementsUpdate || inspection.requirements,
        orderId,
        taskId: inspection.id,
        jobType: 'inspections',
        deleteRequirements: inspection.requirementsDelete
          ? inspection.requirementsDelete.map((r) => r.id)
          : [],
      })
    }
  }

  await batch.commit()
}
