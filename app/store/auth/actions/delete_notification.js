import { deleteDoc, doc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export function delete_notification(_, notiId) {
  const user = auth.currentUser
  const notiRef = doc(db, `users/${user.uid}/notifications/${notiId}`)

  return deleteDoc(notiRef)
}
