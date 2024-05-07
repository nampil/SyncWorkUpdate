const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')
const { getAuth } = require('firebase-admin/auth')
const db = admin.firestore()

exports.addNewUser = functions.https.onCall(async (data, context) => {
  const authAdminLevel = parseInt(context.auth.token.adminLevel)

  const {
    password,
    email,
    authLevel,
    displayName,
    name,
    lastName,
    rol,
    userDocuments,
    appAccess,
    webAccess,
    nickname,
    companyName,
    phoneNumber,
    comments,
    address,
    disabled,
    departments,
  } = data
  if (authAdminLevel < 9 || parseInt(authLevel) > authAdminLevel) {
    return {
      error: 'No Authorized',
    }
  }

  const notMeetPrecondition = [
    email,
    authLevel,
    displayName,
    password,
    name,
    lastName,
    rol,
    appAccess,
    webAccess,
    phoneNumber,
    address,
    disabled,
    departments,
  ].some((item) => {
    return typeof item === 'undefined' || item === null
  })

  if (notMeetPrecondition) {
    return {
      error: 'Not meet Precondition',
    }
  }

  const userRecord = await getAuth().createUser({
    email,
    password,
    displayName,
    disabled,
  })

  if (!userRecord) {
    return { error: "Can't create user record" }
  }

  const claimsSetted = await getAuth().setCustomUserClaims(userRecord.uid, {
    authLevel,
    rol,
    appAccess,
    webAccess,
  })
  const userProfileAdded = await db.doc(`users/${userRecord.uid}`).set({
    email,
    name,
    nickname: nickname || '',
    lastName,
    fullName: displayName,
    uid: userRecord.uid,
    rol,
    archived: false,
    departments,
  })

  const userAdminProfileAdded = await db
    .doc(`users/${userRecord.uid}/admin/profile`)
    .set({
      companyName: companyName || '',
      phoneNumber: phoneNumber || '',
      comments: comments || '',
      address: address || '',
      userDocuments: userDocuments || [],
      disabled,
      departments,
      uid: userRecord.uid,
    })

  return Promise.all([claimsSetted, userProfileAdded, userAdminProfileAdded])
    .then(() => {
      return { message: 'User registered', uid: userRecord.uid }
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.log('error', error)
      return { error }
    })
})
