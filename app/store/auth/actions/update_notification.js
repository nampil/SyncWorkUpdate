import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export function update_notification(_, { notiId, objectToUpdate }) {
  const user = auth.currentUser
  const notiRef = doc(db, `users/${user.uid}/notifications/${notiId}`)

  return updateDoc(notiRef, objectToUpdate)
}
