const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')
const db = admin.firestore()

exports.unassignOrder = functions.https.onCall(async (data, context) => {
  // Check for autorization
  const authAdminLevel = parseInt(context.auth.token.adminLevel)
  const authRol = context.auth.token.rol
  if (authRol !== 'admin' && authAdminLevel < 5) {
    return {
      error: 'No Authorized',
    }
  }

  const { orderId, contractors } = data

  // Check for precondition
  if (!orderId || !contractors || !contractors.length) {
    return {
      error: 'Required data not provided',
    }
  }
  try {
    const orderRef = db.doc(`orders/${orderId}`)
    const userId = context.auth.uid

    const user = await db
      .doc(`users/${userId}`)
      .then((doc) => ({ ...doc.data(), id: doc.id }))

    const res = db.runTransaction(async (t) => {
      const order = await t.get(orderRef)

      const _contractors = order.data().contractor
      contractors.forEach((c) => {
        _contractors.forEach((_c) => {
          const indexToRemove = _c.map((c) => _c.uid).indexOf(c.uid)
          if (indexToRemove < 0) {
            _contractors.splice(indexToRemove, 1)
          }
        })
      })

      if (_contractors.length === 0) {
        t.update(orderRef, {
          assigned: false,
          contractor: [],
          updatedBy: user,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        t.update(orderRef, {
          contractor: admin.firestore.FieldValue.arrayRemove(...contractors),
          updatedBy: user,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    })
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)

    return { error: 'Internal Error', errorObj: error }
  }
})
