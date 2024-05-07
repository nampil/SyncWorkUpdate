import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_ordersFilters({ rootState, commit }, ordersFilters) {
  const user = rootState.auth.user.profile
  const userPreferencesRef = doc(
    collection(db, `users/${user.uid}/preferences`),
    'userPreferences'
  )

  await setDoc(userPreferencesRef, { ordersFilters }, { merge: true })

  commit('auth/set_ordersFilters', { ...ordersFilters }, { root: true })
}
