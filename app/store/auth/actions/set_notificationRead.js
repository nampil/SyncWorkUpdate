import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export function set_notificationRead(_, { notiId, read }) {
  const user = auth.currentUser
  const notiRef = doc(db, `users/${user.uid}/notifications/${notiId}`)

  return updateDoc(notiRef, { read })
}
