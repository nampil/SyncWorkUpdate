const functions = require('firebase-functions')

const { getAuth } = require('firebase-admin/auth')

exports.getUsersList = functions.https.onCall(async (data, context) => {
  if (!context.auth && parseInt(context.auth.token.adminLevel) < 9) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  const listUsersResult = await getAuth().listUsers()

  const _users = []

  listUsersResult.users.forEach((userRecord) => {
    _users.push(userRecord)
  })

  return _users
})
