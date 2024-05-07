import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_bids(_, { orderId }) {
  // eslint-disable-next-line
  console.log('Get Bids for orderid', orderId)

  const bids = []
  const q = query(
    collection(db, `orders/${orderId}/bids`),
    orderBy('createdAt', 'asc')
  )

  const querySnapshot = await getDocs(q)

  let position = 1

  querySnapshot.forEach((doc) => {
    bids.push({
      ...doc.data(),
      position,
      id: doc.id,
    })
    position++
  })

  return bids
}
