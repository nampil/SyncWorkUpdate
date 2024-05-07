import { doc, updateDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '~/plugins/firebase'

export async function add_new_user({ dispatch, commit }, { objectToSend }) {
  const addNewUser = httpsCallable(functions, 'addNewUser')
  const {
    fileAvatar,
    filesDocuments,
    avatar,
    userDocuments,
    ..._objectToSend
  } = objectToSend

  let _avatar = avatar
  let _userDocuments = userDocuments

  const { data } = await addNewUser(_objectToSend)
  if (data && data.error) {
    // eslint-disable-next-line
    console.log('Error', data.error)
    this.$mainAlertError('Error')
    return
  }

  if (fileAvatar && data && data.uid) {
    const urls = await dispatch('update_pic_for_profile', {
      file: fileAvatar,
      uid: data.uid,
    })
    _avatar = urls[0]
  }
  if (filesDocuments && filesDocuments.length && data && data.uid) {
    const urls = await dispatch('update_pic_for_documents', {
      files: filesDocuments,
      uid: data.uid,
    })
    _userDocuments = urls
  }
  const userAdminRef = doc(db, `users/${data.uid}/admin`, 'profile')
  await updateDoc(userAdminRef, {
    userDocuments: _userDocuments,
  })

  const userRef = doc(db, 'users', `${data.uid}`)
  await updateDoc(userRef, {
    avatar: _avatar,
  })

  commit('add_userTemplate', {
    archived: false,
    id: userRef.id,
    customClaims: {
      authLevel: objectToSend.authLevel,
      rol: objectToSend.rol,
      appAccess: objectToSend.appAccess,
      webAccess: objectToSend.webAccess,
    },
    uid: userRef.id,
    email: objectToSend.email,
    name: objectToSend.name,
    fullName: objectToSend.name + '' + objectToSend.lastName,
    lastName: objectToSend.lastName,
    rol: objectToSend.rol,
    ...(avatar && {
      avatar: _avatar,
    }),
    nickname: objectToSend.nickname,
    disabled: objectToSend.disabled,
  })
}
