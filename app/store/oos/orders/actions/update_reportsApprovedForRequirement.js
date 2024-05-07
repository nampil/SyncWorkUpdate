import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_reportsApprovedForRequirement(
  { rootState },
  { task, requirement, orderId, reportsApproved }
) {
  const user = rootState.auth.user.profile
  const requirementRef = doc(
    db,
    `orders/${orderId}/${task.type}/${task.id}/requirements/${requirement.id}`
  )
  const objectToSend = {
    oosChecked: reportsApproved,
    contractorCompleted: reportsApproved,
    finishedBy: reportsApproved ? user : null,
    finished: reportsApproved,
    finishedAt: reportsApproved ? serverTimestamp() : null,
  }
  await updateDoc(requirementRef, objectToSend)
}
