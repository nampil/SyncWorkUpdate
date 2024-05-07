const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')

const db = admin.firestore()

exports.allowablesPoolsOnWrite = functions.firestore
  .document('orders/{orderId}/allowablesPools/{allowablePoolId}')
  .onWrite(async (change, context) => {
    const document = change.after.exists ? change.after.data() : null
    const orderId = context.params.orderId
    const orderRef = db.doc(`orders/${orderId}`)
    if (!document) {
      await orderRef.update({
        allowablesPoolsIds: admin.firestore.FieldValue.arrayRemove(
          context.params.allowablePoolId
        ),
      })

      return null
    }
    const user = document.updatedBy

    if (!change.before.exists) {
      await orderRef.update({
        allowablesPoolsIds: admin.firestore.FieldValue.arrayUnion(
          context.params.allowablePoolId
        ),
      })
    }

    const oldDocument = change.before.data()

    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping(
        { allowablesPools: oldDocument },
        { allowablesPools: document }
      ),
    }

    const historyRef = db.collection(`orders/${orderId}/history`)

    return historyRef.add(objToSave)
  })
