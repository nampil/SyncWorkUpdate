import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_statusesOrders({ commit, dispatch }, { orderId }) {
  const statusesRef = collection(db, `orders/${orderId}/status`)
  const q = query(statusesRef, orderBy('createdAt', 'asc'))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const usersToFetchProfile = []

    snapshot.docChanges().forEach((change) => {
      const doc = {
        ...change.doc.data(),
        id: change.doc.id,
        createdAt:
          change.doc.data().createdAt || Timestamp.fromDate(new Date()),
      }

      if (change.type === 'added') {
        if (doc.createdBy) {
          usersToFetchProfile.push(doc.createdBy)
        }

        commit('add_statusOrder', {
          orderId,
          status: doc,
        })
      }
      if (change.type === 'modified') {
        commit('update_statusOrder', { orderId, status: doc })
      }
      if (change.type === 'removed') {
        commit('remove_statusOrder', { orderId, status: doc })
      }
    })
    if (usersToFetchProfile.length) {
      dispatch(
        'auth/get_usersProfile',
        {
          usersIds: usersToFetchProfile,
        },
        { root: true }
      )
    }
  })
  commit('set_statusOrderUnsubscribe', unsubscribe)
}
