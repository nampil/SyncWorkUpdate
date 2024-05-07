import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_ordersFilters(
  { rootState, commit },
  { ordersFilters }
) {
  const user = rootState.auth.user.profile

  const userPreferencesRef = doc(
    db,
    `users/${user.uid}/preferences`,
    'userPreferences'
  )
  await updateDoc(userPreferencesRef, {
    ordersFilters,
  })
  commit('auth/set_ordersFilters', ordersFilters, { root: true })
}
