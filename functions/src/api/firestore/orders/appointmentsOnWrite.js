const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')

const db = admin.firestore()

exports.appointmentsOnWrite = functions.firestore
  .document('orders/{orderId}/appointments/{appointmentId}')
  .onWrite(async (change, context) => {
    const document = change.after.exists ? change.after.data() : null
    if (!document) {
      return null
    }
    const user = document.updatedBy

    const oldDocument = change.before.data()
    const orderId = context.params.orderId

    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping(
        { appointments: oldDocument },
        { appointments: document }
      ),
    }

    const historyRef = db.collection(`orders/${orderId}/history`)

    return historyRef.add(objToSave)
  })
