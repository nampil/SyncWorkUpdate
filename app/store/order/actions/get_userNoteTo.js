import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_userNoteTo(_, { userUids }) {
  const q = query(collection(db, 'users'), where('uid', 'in', userUids))
  const users = []
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const userProfile = {
      ...doc.data(),
      uid: doc.id,
    }
    users.push(userProfile)
  })
  return users
}
