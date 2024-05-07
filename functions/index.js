// const functions = require('firebase-functions')
// const admin = require('firebase-admin')
// const { getAuth } = require('firebase-admin/auth')
// admin.initializeApp()

// const db = admin.firestore()

const { addNewUser } = require('./api/http/addNewUser')
const { assignOrder } = require('./api/http/assignOrder')
const { unassignOrder } = require('./api/http/unassignOrder')
exports.addNewUser = addNewUser
exports.unassignOrder = unassignOrder
exports.assignOrder = assignOrder

// exports.addNewUserIndex = functions.https.onCall(async (data, context) => {
//   const authAdminLevel = parseInt(context.auth.token.adminLevel)

//   const { email, authLevel, displayName, password, name, lastName } = data
//   if (authAdminLevel < 9 || parseInt(authLevel) > authAdminLevel) {
//     return {
//       error: 'No Authorized',
//     }
//   }

//   try {
//     const userRecord = await getAuth().createUser({
//       email,
//       password,
//       displayName,
//     })

//     await getAuth().setCustomUserClaims(userRecord.uid, { authLevel })
//     await db.doc(`users/${userRecord.uid}`).set({
//       email,
//       name,
//       lastName,
//       fullName: displayName,
//       uid: userRecord.uid,
//     })
//     return { message: 'User registed' }
//   } catch (error) {
//     // eslint-disable-next-line
//     console.log(error)
//     return { error }
//   }
// })
