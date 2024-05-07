import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_orderStatusHistory({ dispatch }, { orderId, lastStatus }) {
  // eslint-disable-next-line
  console.log('get_orderStatusHistory', orderId, lastStatus)

  const orderStattusHistoryRef = collection(db, `orders/${orderId}/status`)
  const queryConstraints = []
  queryConstraints.push(orderBy('createdAt', 'desc'))
  queryConstraints.push(limit(15))

  if (lastStatus) {
    queryConstraints.push(startAfter(lastStatus))
  }
  const q = query(orderStattusHistoryRef, ...queryConstraints)

  return getDocs(q).then((snapshot) => {
    const statusHistory = []
    snapshot.forEach((doc) => {
      const createdById = doc.data().createdBy
      dispatch(
        'auth/get_usersProfile',
        { usersIds: [createdById] },
        { root: true }
      )

      statusHistory.push({
        ...doc.data(),
        id: doc.id,
      })
    })
    return {
      statusHistory,
      noMoreData: snapshot.size < 15,
    }
  })
}
