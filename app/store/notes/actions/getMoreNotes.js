import {
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  getDocs,
  startAfter,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function getMoreNotes({ commit }, { orderId, lastNoteId }) {
  const notesRef = collection(db, `orders/${orderId}/notes`)

  const docSnap = await getDoc(doc(notesRef, lastNoteId))

  const q = query(
    notesRef,
    limit(20),
    orderBy('updatedAt', 'desc'),
    startAfter(docSnap)
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return { noMore: true }
  }

  querySnapshot.forEach((doc) => {
    const docData = {
      ...doc.data(),
      id: doc.id,
    }
    commit('add_note', docData)
  })
  return { noMore: false }
}
