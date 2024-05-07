import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_datesAdmin(_, { userUid }) {
  const userRef = doc(db, `users/${userUid}/admin`, 'profile')
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    return docSnap.data()
  }
  return null
}
