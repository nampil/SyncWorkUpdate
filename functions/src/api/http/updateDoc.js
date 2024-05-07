const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')

const db = admin.firestore()

exports.updateDoc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  const authAdminLevel = parseInt(context.auth.token.adminLevel)

  if (authAdminLevel < 7) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authorized.'
    )
  }

  const { docPath, objToUpdate } = data

  if (!docPath || !objToUpdate) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Doc path and object to update are requiered.'
    )
  }

  const docRef = db.doc(docPath)

  return docRef.update(objToUpdate)
})
