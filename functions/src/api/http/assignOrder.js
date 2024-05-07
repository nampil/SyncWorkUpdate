const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')

exports.assignOrder = functions.https.onCall(async (data, context) => {
  const db = admin.firestore()
  // Check for autorization
  const authAdminLevel = parseInt(context.auth.token.adminLevel)
  const authRol = context.auth.token.rol
  if (authRol !== 'admin' && authAdminLevel < 5) {
    return {
      error: 'No Authorized',
    }
  }

  const { orderId, usersIds } = data

  // Check for precondition
  if (!orderId || !usersIds || !usersIds.length) {
    return {
      error: 'Required data not provided',
    }
  }

  try {
    const promises = []

    const userId = context.auth.uid

    const user = await db
      .doc(`users/${userId}`)
      .then((doc) => ({ ...doc.data(), id: doc.id }))

    usersIds.forEach((userId) => {
      const userRef = db.doc(`users/${userId}`)
      const promise = userRef.get().then((doc) => doc.data())

      promises.push(promise)
    })

    const results = await Promise.all(promises)

    const objectsToSend = results.map((userProfile) => {
      return {
        uid: userProfile.uid,
        name: userProfile.name,
        lastName: userProfile.lastName,
        fullName: userProfile.fullName || '',
      }
    })
    const orderRef = db.doc(`orders/${orderId}`)

    return orderRef.update({
      assigned: true,
      contractor: admin.firestore.FieldValue.arrayUnion(...objectsToSend),
      contractorsUids: admin.firestore.FieldValue.arrayUnion(...usersIds),
      updatedBy: user,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)

    return { error: 'Internal Error', errorObj: error }
  }
})
