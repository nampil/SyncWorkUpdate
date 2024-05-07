import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function updateNote({ rootState }, { text, noteId, orderId }) {
  const userProfile = rootState.auth.user.profile
  const notesRef = doc(db, 'orders', orderId, 'notes', noteId)
  await setDoc(
    notesRef,
    {
      updatedBy: userProfile,
      updatedAt: serverTimestamp(),
      text,
    },
    { merge: true }
  )
}
