const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')
const { getAuth } = require('firebase-admin/auth')
const db = admin.firestore()

exports.getSupervisorsList = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  try {
    const supervisorsRef = db.collection('users').where('rol', '==', 'admin')

    const querySnapshot = await supervisorsRef.get()

    const adminUsers = []
    querySnapshot.forEach((doc) => {
      adminUsers.push({
        ...doc.data(),
        id: doc.id,
      })
    })

    const supervisorsList = []

    for (let index = 0; index < adminUsers.length; index++) {
      const user = adminUsers[index]

      const userRecord = await getAuth()
        .getUser(user.id)
        .catch((error) => {
          if (error.code === 'auth/user-not-found') return null
        })
      if (!userRecord) continue
      const { authLevel } = userRecord.customClaims

      if (authLevel && parseInt(authLevel) > 7) {
        supervisorsList.push(user)
      }
    }
    return supervisorsList
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)

    return { error }
  }
})
