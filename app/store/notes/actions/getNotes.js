import {
  Timestamp,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function getNotes({ commit, state }, { orderId }) {
  return new Promise((resolve, reject) => {
    const notesRef = collection(db, `orders/${orderId}/notes`)
    const q = query(notesRef, limit(20), orderBy('updatedAt', 'desc'))
    let isEmpty = false

    const unsubscriber = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        isEmpty = true
      }
      snapshot.docChanges().forEach((change) => {
        const doc = {
          ...change.doc.data(),
          id: change.doc.id,
          ...(!change.doc.data().updatedAt && { updatedAt: Timestamp.now() }),
        }
        if (change.type === 'added') {
          commit('add_note', doc)
        }
        if (change.type === 'modified') {
          commit('update_note', doc)
        }
        // if (change.type === 'removed') {
        //   commit('delete_note', { id: doc.id })
        // }
      })
    })
    let counter = 0
    setInterval(() => {
      if (state.notes.length && counter < 100) {
        resolve()
      } else if (isEmpty && counter < 100) {
        resolve()
      } else if (counter >= 100) {
        reject(new Error('timeout'))
      }
      counter++
    }, 100)
    commit('set_notesUnsubscriber', unsubscriber)
  })
}
