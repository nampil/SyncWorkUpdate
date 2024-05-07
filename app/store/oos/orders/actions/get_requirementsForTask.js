import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_requirementsForTask(_, { orderId, taskId, type }) {
  const q = query(
    collection(db, `orders/${orderId}/${type}/${taskId}/requirements`)
  )
  const requirements = []
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const _requirements = {
      ...doc.data(),
      id: doc.id,
    }
    requirements.push(_requirements)
  })
  return requirements
}
