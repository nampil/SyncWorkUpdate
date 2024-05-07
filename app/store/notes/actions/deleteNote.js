import { collection, deleteDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function deleteNote(_, { note, orderId }) {
  const notesRef = collection(db, 'orders', orderId, 'notes', note.id)
  await deleteDoc(notesRef)
}
