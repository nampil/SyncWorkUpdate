import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_userById(_, { userId }) {
  if (!userId) throw new Error('No userId')

  try {
    const userAdminRef = collection(db, `users/${userId}/`, 'admin')

    const querySnapshot = await getDocs(userAdminRef)

    const userData = {}

    querySnapshot.forEach((doc) => {
      userData[`${doc.id}`] = doc.data()
    })

    const publicprofileRef = doc(db, `users`, userId)
    const publicprofileDoc = await getDoc(publicprofileRef)
    const userPublicProfile = publicprofileDoc.data()
    userData.profile = userPublicProfile

    return userData
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)

    throw new Error(error)
  }
}
