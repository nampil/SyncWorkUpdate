import { collection, doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_ordersFilters({ commit, rootState }) {
  const user = rootState.auth.user.profile

  const userPreferencesRef = doc(
    collection(db, `users/${user.uid}/preferences`),
    'userPreferences'
  )
  const datos = await getDoc(userPreferencesRef)

  commit('add_ordersFilters', datos.data().ordersFilters)
  return datos.data() ? datos.data().ordersFilters : {}
}
