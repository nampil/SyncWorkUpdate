import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function addNote({ rootState }, { text, orderId }) {
  const notesRef = collection(db, 'orders', orderId, 'notes')
  const userProfile = rootState.auth.user.profile
  await addDoc(notesRef, {
    text,
    updatedBy: userProfile,
    updatedAt: serverTimestamp(),
  })
}
