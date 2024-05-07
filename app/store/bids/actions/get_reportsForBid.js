import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reportsForBid(_, { orderId, bidId }) {
  const reports = []
  const q = query(collection(db, `orders/${orderId}/bids/${bidId}/reports`))
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    reports.push({
      ...doc.data(),
      id: doc.id,
    })
  })

  return reports.sort((a, b) => {
    return a.position > b.position ? 1 : -1
  })
}
