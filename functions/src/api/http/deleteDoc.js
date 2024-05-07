const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')

const db = admin.firestore()
const storage = admin.storage()

exports.deleteDoc = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  const authAdminLevel = parseInt(context.auth.token.adminLevel)

  if (authAdminLevel < 8) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authorized.'
    )
  }

  const { docPath } = data

  if (!docPath) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Doc path is required.'
    )
  }

  const docRef = db.doc(docPath)

  const file = storage.bucket().file(docPath)

  const fileDeleted = file.delete()
  const docDeleted = docRef.delete()
  await Promise.all([fileDeleted, docDeleted])
  return null
})
