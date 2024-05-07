import { collection, doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_preferences({ commit }, uid) {
  const userPreferencesRef = doc(
    collection(db, `users/${uid}/preferences`),
    'userPreferences'
  )
  const docSnap = await getDoc(userPreferencesRef)

  if (docSnap.exists()) {
    commit('set_preferences', docSnap.data())
  }
}
