const functions = require('firebase-functions')
const { admin } = require('./admin')
const { getMessaging } = require('firebase-admin/messaging')
const db = admin.firestore()

exports.handleNotifications = async (
  {
    users,
    message,
    icon,
    type,
    link,
    imgUrl,
    objToUpdate,
    docPath,
    docDesc,
    resourcesToDelete,
    extraData,
  },
  sendMessageInApp
) => {
  // Comprobacion si existen los datos necesarios

  if (!users?.length || !message?.title || !message?.body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'All field are required'
    )
  }

  const truncateMsg = (
    { title = '', body = '' },
    titleLimit = 40,
    bodyLimit = 100
  ) => {
    let _title = title
    let _body = body

    if (title.length > titleLimit) {
      _title = title.substring(0, titleLimit) + ' ...'
    }
    if (body.length > bodyLimit) {
      _body = body.substring(0, bodyLimit) + ' ...'
    }

    return {
      title: _title,
      body: _body,
    }
  }

  const truncateMessage = truncateMsg(message, 40, 100)

  // Recoleccion de todos los tokens para notificaciones de los usuarios

  const registrationTokenPromises = []

  for (let index = 0; index < users.length; index++) {
    const user = users[index]
    const registrationTokens = getRegistrationToken(user)

    registrationTokenPromises.push(registrationTokens)
  }

  function getRegistrationToken(uid) {
    const tokensRef = db.doc(`users/${uid}/subscriptions/tokenList`)
    const tokens = tokensRef.get().then((snapshot) => {
      if (!snapshot.exists) {
        return {
          userId: uid,
          tokens: [],
        }
      }

      return {
        userId: uid,
        tokens: snapshot.data().tokens,
      }
    })
    return tokens
  }

  const registrationTokenList = await Promise.all(registrationTokenPromises)

  const registrationTokenListFlat = registrationTokenList
    .map((itemList) => itemList.tokens)
    .flat()

  // Si no hay tokens, retornamos

  if (!registrationTokenListFlat.length) {
    return null
  }

  // Preparamos y enviamos objeto para distribucion
  const messageToSend = {
    notification: { ...truncateMessage, ...(icon && { image: icon }) },
    android: {
      ttl: 8640000,
      priority: 'HIGH',
      notification: {
        ...(!icon && { icon: 'noti_logo' }),
        color: '#2b98f0',
        ...(imgUrl && { imageUrl: imgUrl }),
        notification_priority: 'PRIORITY_HIGH',
        click_action: 'daytona_sync',
      },
    },
    webpush: {
      headers: {
        ...(imgUrl && { image: imgUrl }),
      },
      ...(link && {
        fcm_options: {
          link: `https://daytona-system-dev.web.app${link}`,
        },
      }),
    },

    data: {
      ...truncateMessage,
      ...(link && { link }),
      ...(type && { type }),
      ...(extraData && { extraData }),
    },
    tokens: registrationTokenListFlat,
  }

  const response = await getMessaging().sendMulticast(messageToSend)

  // Capturamos las respuesta de los envios que fallaron para hacer limpieza de los tokens que no funcionaron en la base de datos
  const tokensSaved = []

  if (response.failureCount > 0) {
    const failedTokens = []
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(registrationTokenListFlat[idx])
      }
    })

    registrationTokenList.forEach((itemList) => {
      const userId = itemList.userId
      const tokens = itemList.tokens

      const tokensToSave = tokens.filter(
        (token) => !failedTokens.includes(token)
      )

      const tokensRef = db.doc(`users/${userId}/subscriptions/tokenList`)

      const savedTokens = tokensRef.set({
        tokens: tokensToSave,
      })

      tokensSaved.push(savedTokens)
    })
  }

  let notificationsInApp = null

  if (sendMessageInApp) {
    const batch = db.batch()

    for (let index = 0; index < users.length; index++) {
      const user = users[index]

      const notificationsRef = db
        .collection(`users/${user}/notifications`)
        .doc()

      batch.set(notificationsRef, {
        ...truncateMessage,
        read: false,
        ...(type && { type }),
        ...(link && { link }),
        ...(imgUrl && { imgUrl }),
        ...(type === 'AUTH_FOR_UPDATE_DOC' && { objToUpdate }),
        ...(type === 'AUTH_FOR_UPDATE_DOC' && { docPath }),
        ...(type === 'AUTH_FOR_UPDATE_DOC' && { docDesc }),
        ...(type === 'AUTH_FOR_DELETE_DOC' &&
          resourcesToDelete &&
          resourcesToDelete.length && { resourcesToDelete }),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
    notificationsInApp = batch.commit()
  }

  return Promise.all([...tokensSaved, notificationsInApp])
}
