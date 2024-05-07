import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export async function update_profile(
  { dispatch, rootState, commit },
  { rawUserProfileToUpdate, isEqual }
) {
  const userInStore = rootState.auth.user
  const user = auth.currentUser

  if (rawUserProfileToUpdate.file) {
    const urls = await dispatch('update_pic_for_profile', {
      file: rawUserProfileToUpdate.file,
      uid: user.uid,
    })

    rawUserProfileToUpdate.avatar = urls[0]
  }

  // eslint-disable-next-line
  const { file, ...userProfileToUpdate } = rawUserProfileToUpdate

  const promises = []

  if (
    userProfileToUpdate.name !== userInStore.profile.name ||
    userProfileToUpdate.lastName !== userInStore.profile.lastName ||
    userProfileToUpdate.fullName !== userInStore.profile.fullName ||
    !isEqual(userInStore.profile.avatar, userProfileToUpdate.avatar)
  ) {
    const userRef = doc(db, 'users', user.uid)

    const updateProfileInDB = updateDoc(userRef, userProfileToUpdate)
    promises.push(updateProfileInDB)
  }

  if (userInStore.profile.fullName !== userProfileToUpdate.fullName) {
    const objectToUpdate = {
      displayName: userProfileToUpdate.fullName,
      photoURL: userProfileToUpdate.avatar.url,
    }

    // Actualizando en Authentication de Firebase
    const updateProfileInAuth = updateProfile(auth.currentUser, objectToUpdate)
    promises.push(updateProfileInAuth)
  }

  await Promise.all(promises)

  commit('update_user_profile', userProfileToUpdate)
}
