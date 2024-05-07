import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_usersProfile({ state, commit }, { usersIds }) {
  const users = state.users.map((u) => u.uid)
  const usersIdsToFetch = usersIds.filter((u) => !users.includes(u))

  const chunkSize = 30 // maximum number of disjunctions in disjunctive normal form https://firebase.google.com/docs/firestore/query-data/queries?hl=en&authuser=0#limits_on_or_queries

  for (let i = 0; i < usersIdsToFetch.length; i += chunkSize) {
    const chunkUsersIds = usersIdsToFetch.slice(i, i + chunkSize)
    const usersRef = collection(db, `users`)
    const q = query(usersRef, where('uid', 'in', chunkUsersIds))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach((doc) => {
      const _userProfile = {
        ...doc.data(),
      }
      commit('add_user', _userProfile)
    })
  }
}
