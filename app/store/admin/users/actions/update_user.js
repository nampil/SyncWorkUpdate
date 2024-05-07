import { httpsCallable } from 'firebase/functions'
import { functions } from '~/plugins/firebase'

export async function update_user(
  { dispatch, commit },
  { objectToSend, type }
) {
  const updateUser = httpsCallable(functions, 'updateUser')

  const uid = objectToSend.uid
  let picsToDelete = []
  /* Update files avatar storage */
  if (objectToSend.fileAvatar) {
    const urls = await dispatch('update_pic_for_profile', {
      file: objectToSend.fileAvatar,
      uid,
    })
    objectToSend.avatar = urls[0]
  }
  /* Eliminar files avatar del storage cuando el avatar en null */
  if (
    objectToSend.fileAvatar === null &&
    objectToSend.avatar === null &&
    objectToSend.avatarBase !== null
  ) {
    await dispatch('remove_pic_for_avatar', {
      uid,
      url: objectToSend.avatarBase.url,
    })
    objectToSend.avatar = null
  }
  /* Eliminar files userDocuments del storage cuando el userDocuments en null */
  if (
    objectToSend.filesDocuments === null &&
    objectToSend.userDocuments === null &&
    objectToSend.userDocumentsBase !== null
  ) {
    await dispatch('remove_pic_for_user_documents', {
      picsToDelete: objectToSend.userDocumentsBase,
      uid,
    })
    objectToSend.userDocuments = []
  }
  /* Eliminar files userDocuments storage */
  if (objectToSend.userDocumentsBase && objectToSend.userDocumentsBase.length) {
    picsToDelete = objectToSend.userDocumentsBase.filter((pic) => {
      const index = objectToSend.userDocuments
        .map((pic) => pic.codeName)
        .indexOf(pic.codeName)
      return index === -1
    })

    if (picsToDelete.length) {
      await dispatch('remove_pic_for_user_documents', {
        picsToDelete,
        uid,
      })
    }
  }
  if (objectToSend.filesDocuments && objectToSend.filesDocuments.length) {
    const urls = await dispatch('update_pic_for_documents', {
      files: objectToSend.filesDocuments,
      uid,
    })
    objectToSend.userDocuments = urls
  }
  const {
    fileAvatar,
    filesDocuments,
    userDocumentsBase,
    avatarBase,
    ..._objectToSend
  } = objectToSend

  if (picsToDelete.length) {
    const _userDocumentsBase = userDocumentsBase
    for (let j = 0; j < picsToDelete.length; j++) {
      const b = picsToDelete[j]
      for (let i = 0; i < userDocumentsBase.length; i++) {
        const a = userDocumentsBase[i]
        if (a.codeName === b.codeName) {
          _userDocumentsBase.splice(i, 1)
        }
      }
    }

    const array = _userDocumentsBase.concat(_objectToSend.userDocuments)
    for (let i = 0; i < array.length; ++i) {
      for (let j = i + 1; j < array.length; ++j) {
        if (array[i].codeName === array[j].codeName) {
          array.splice(j, 1)
        }
      }
    }

    _objectToSend.userDocuments = array
  }
  if (
    !picsToDelete.length &&
    objectToSend.filesDocuments &&
    objectToSend.filesDocuments.length
  ) {
    _objectToSend.userDocuments = userDocumentsBase.concat(
      _objectToSend.userDocuments
    )
  }

  const respuesta = await updateUser(_objectToSend)

  if (type === 'update') {
    commit('update_userTemplate', {
      id: uid,
      archived: false,
      customClaims: {
        authLevel: objectToSend.authLevel,
        rol: objectToSend.rol,
        appAccess: objectToSend.appAccess,
        webAccess: objectToSend.webAccess,
      },
      uid,
      email: objectToSend.email,
      name: objectToSend.name,
      fullName: objectToSend.name + '' + objectToSend.lastName,
      lastName: objectToSend.lastName,
      rol: objectToSend.rol,
      ...(objectToSend.avatar && {
        avatar: objectToSend.avatar,
      }),
      nickname: objectToSend.nickname,
      disabled: objectToSend.disabled,
    })
  }
  if (type === 'delete') {
    commit('remove_userTemplate', objectToSend)
  }

  return respuesta
}
