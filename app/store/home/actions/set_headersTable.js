import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_headersTable({ rootState, commit }, headers) {
  const user = rootState.auth.user.profile
  const userPreferencesRef = doc(
    collection(db, `users/${user.uid}/preferences`),
    'userPreferences'
  )

  await setDoc(userPreferencesRef, { headers }, { merge: true })
  commit('auth/set_headersTable', headers, { root: true })
}
