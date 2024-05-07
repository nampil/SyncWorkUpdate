import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export async function getAllUsers({ commit, dispatch }) {
  const usersRef = collection(db, 'users')
  const user = auth.currentUser

  const q = query(usersRef, where('uid', '!=', user.uid))
  const users = []
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    users.push({
      ...doc.data(),
    })
  })

  commit('set_allUsers', users)
}
