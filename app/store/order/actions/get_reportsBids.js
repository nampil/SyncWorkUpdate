import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reportsBids(_, { orderId, bids }) {
  const reports = []
  for (let i = 0; i < bids.length; i++) {
    const _bid = bids[i]
    const q = query(collection(db, `orders/${orderId}/bids/${_bid.id}/reports`))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach((doc) => {
      reports.push({
        ...doc.data(),
        id: doc.id,
        titleBid: _bid.title,
        bidId: _bid.id,
        bidPosition: _bid.position,
      })
    })
  }

  return reports
    .map((workToDo) => workToDo)
    .sort((a, b) => {
      return a.position > b.position ? 1 : -1
    })
}
