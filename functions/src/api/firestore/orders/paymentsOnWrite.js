const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')

const db = admin.firestore()

exports.paymentsOnWrite = functions.firestore
  .document('orders/{orderId}/invoice/{invoiceId}/payments/{paymentId}')
  .onWrite(async (change, context) => {
    async function updateOrder(orderId) {
      const paymentsRef = db.collection(
        `orders/${orderId}/invoice/invoiceData/payments`
      )

      const payments = await paymentsRef.get().then((querySnapshot) => {
        const _payments = []
        querySnapshot.forEach((doc) => {
          _payments.push(doc.data())
        })
        return _payments
      })

      let total = 0.0
      payments.forEach((element) => {
        total += parseFloat(element.amount)
      })
      const orderRef = db.doc(`orders/${orderId}`)
      const orderUpdatedPromise = orderRef.update({
        clientInvoicePayment: total.toFixed(2),
      })
      return orderUpdatedPromise
    }

    const document = change.after.exists ? change.after.data() : null
    const orderId = context.params.orderId

    if (!document) {
      return updateOrder(orderId)
    }
    const user = document.updatedBy
    const oldDocument = change.before.data()
    const promises = []

    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping({ payments: oldDocument }, { payments: document }),
    }

    const historyRef = db.collection(`orders/${orderId}/history`)
    const historyUpdatePromise = historyRef.add(objToSave)
    promises.push(historyUpdatePromise)

    if (!oldDocument) {
      const orderUpdatedPromise = updateOrder(orderId)
      promises.push(orderUpdatedPromise)
    }

    if (oldDocument) {
      if (oldDocument.amount !== document.amount) {
        const orderUpdatedPromise = updateOrder(orderId)
        promises.push(orderUpdatedPromise)
      }
    }

    return Promise.all(promises)
  })
