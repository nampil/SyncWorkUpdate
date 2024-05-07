import { collection, doc, setDoc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export async function set_profileLanguage(
  { rootState, commit },
  { userProfileLanguage }
) {
  const userInStore = rootState.auth.user
  const user = auth.currentUser
  if (userInStore.preferences.language !== userProfileLanguage) {
    const userPreferencesRef = doc(
      collection(db, `users/${user.uid}/preferences`),
      'userPreferences'
    )
    // merge me permite validar si el doc exite lo actualiza y sino lo crea
    await setDoc(
      userPreferencesRef,
      { language: userProfileLanguage },
      { merge: true }
    )
  }
  commit('update_userProfileLanguage', userProfileLanguage)
}
