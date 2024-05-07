import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_usersById({ state, commit }, { usersIds }) {
  if (!usersIds || usersIds.length === 0) return

  const usersIdsInState = state.users.map((user) => user.uid)
  const usersIdsToAdd = usersIds.filter(
    (userId) => !usersIdsInState.includes(userId)
  )

  if (usersIdsToAdd.length === 0) return

  const userRef = collection(db, 'users')
  const q = query(userRef, where('uid', 'in', usersIdsToAdd))
  const snapshot = await getDocs(q)

  snapshot.forEach((doc) => {
    const userProfile = { ...doc.data() }

    commit('add_user', userProfile)
  })
}
