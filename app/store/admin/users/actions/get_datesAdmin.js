import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_datesAdmin(_, uid) {
  const userRef = doc(db, `users/${uid}/admin`, 'profile')
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    return docSnap.data()
  }
  return null

  // const q = query(collection(db, `users/${uid}/admin/`), 'profile')
  // const querySnapshot = await getDocs(q)

  // querySnapshot.forEach((doc) => {
  //   profile = {
  //     ...doc.data(),
  //     id: doc.id,
  //   }
  // })

  // return profile
}
