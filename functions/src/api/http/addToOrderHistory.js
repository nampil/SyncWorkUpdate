const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')
const { getAuth } = require('firebase-admin/auth')
const db = admin.firestore()

exports.addToOrderHistory = functions.https.onCall((data, context) => {
  if (!context.auth) {
    return { error: 'No Auhtorized' }
  }

  const { updatedBy, type, orderId } = data

  const objToSend = {
    type,
    user: updatedBy,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  const historyRef = db.collection(`orders/${orderId}/history`)

  return historyRef.add(objToSend)
})
