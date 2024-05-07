import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_pinJobNote({ _ }, { id, pin, orderId }) {
  const jobNoteRef = doc(collection(db, `orders/${orderId}/jobNotes`), id)
  await updateDoc(jobNoteRef, { pin })
}
