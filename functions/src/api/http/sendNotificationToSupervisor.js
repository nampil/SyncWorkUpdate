const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')
const { handleNotifications } = require('../../utils/handleNotifications')
const db = admin.firestore()

exports.sendNotificationToSupervisor = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called while authenticated.'
      )
    }

    const {
      user,
      message,
      resourcesToDelete,
      docPath,
      docDesc,
      objToUpdate,
      type,
      link,
      imgUrl,
    } = data

    if (!user) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User field is required'
      )
    }
    if (!message.title) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'message.title field is required'
      )
    }
    if (!message.body) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'message.body field is required'
      )
    }
    if (
      type === 'AUTH_FOR_UPDATE_DOC' &&
      (!objToUpdate || !docPath || !docDesc)
    ) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '!objToUpdate || !docPath || !docDesc field are required'
      )
    }
    if (type === 'AUTH_FOR_DELETE_DOC' && !resourcesToDelete.length) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Resources to Delete are required'
      )
    }

    const objToSend = {
      users: [user],
      message,
      type,
      ...(imgUrl && { imgUrl }),
      ...(type === 'AUTH_FOR_UPDATE_DOC' && { objToUpdate }),
      ...(type === 'AUTH_FOR_UPDATE_DOC' && { docPath }),
      ...(type === 'AUTH_FOR_UPDATE_DOC' && { docDesc }),
      ...(type === 'AUTH_FOR_DELETE_DOC' &&
        resourcesToDelete && { resourcesToDelete }),
      link,
    }

    return handleNotifications(objToSend, true)
  }
)
