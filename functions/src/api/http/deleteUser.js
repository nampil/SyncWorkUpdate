const functions = require('firebase-functions')
// const { admin } = require('../../utils/admin')
const { getAuth } = require('firebase-admin/auth')
const firebase_tools = require('firebase-tools')

exports.deleteUser = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .https.onCall(async (data, context) => {
    const { userUid } = data
    if (
      !context.auth ||
      parseInt(context.auth.token.adminLevel) < 9 ||
      !userUid
    ) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called while authenticated.'
      )
    }

    // const userRef = db.doc(`users/${userUid}`)
    // const userAdminRef = db.doc(`users/${userUid}/admin/profile`)

    // const userProfileDeleted = userRef.delete()
    // const userAdminProfileDeleted = userAdminRef.delete()
    const path = `users/${userUid}`
    console.log(`User ${context.auth.uid} has requested to delete path ${path}`)

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    await firebase_tools.firestore.delete(path, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      force: true,
      token: process.env.FBTOKEN,
    })

    return getAuth().deleteUser(userUid)
  })
