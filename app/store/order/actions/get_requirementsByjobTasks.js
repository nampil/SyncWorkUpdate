import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_requirementsByjobTasks(_, { orderId, type, taskId }) {
  const q = query(
    collection(db, `orders/${orderId}/${type}/${taskId}/requirements`)
  )
  const requirements = []

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const req = {
      ...doc.data(),
      id: doc.id,
    }
    requirements.push(req)
  })

  return requirements
}
