import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export async function get_reopens(_, { orderId }) {
  const reopensRef = collection(db, `orders/${orderId}/reopens`)

  const querySnapshot = await getDocs(reopensRef)
  const reopens = []
  querySnapshot.forEach((doc) => {
    const reopen = {
      ...doc.data(),
      id: doc.id,
    }
    reopens.push(reopen)
  })
  return reopens
}
