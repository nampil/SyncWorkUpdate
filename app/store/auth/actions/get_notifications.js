import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'

import { db } from '~/plugins/firebase'

export function get_notifications({ commit }, uid) {
  const notisRef = collection(db, `users/${uid}/notifications`)
  const q = query(notisRef, orderBy('createdAt', 'desc'))
  const notificationsListener = onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      const doc = {
        ...change.doc.data(),
        createdAt: change.doc.data().createdAt.toDate(),
        id: change.doc.id,
        ...(change.doc.data().authorized &&
          !change.doc.data().authorizedAt && {
            authorizedAt: Timestamp.fromDate(new Date()),
          }),
        ...(change.doc.data().extraData && {
          extraData: JSON.parse(change.doc.data().extraData),
        }),
      }

      if (change.type === 'added') {
        commit('add_notification', doc)
      }
      if (change.type === 'modified') {
        commit('update_notification', doc)
      }
      if (change.type === 'removed') {
        commit('delete_notification', doc.id)
      }
    })
  })

  commit('set_notificationsListener', notificationsListener)
}
