const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')

const db = admin.firestore()

exports.invoiceOnWrite = functions.firestore
  .document('orders/{orderId}/invoice/{invoiceId}')
  .onWrite(async (change, context) => {
    const compareItems = (a, b) => {
      if (!a || !b) return false

      return (
        a.length === b.length &&
        a.every(
          (element, index) =>
            JSON.stringify(element) === JSON.stringify(b[index])
        )
      )
    }

    function updateOrder({ document, orderId, iterateItems }) {
      let clientInvoiceTotal = 0
      if (document.items && document.items.length && iterateItems) {
        let subTotalFee = 0.0
        document.items.forEach((element) => {
          subTotalFee += parseFloat(element.qty) * parseFloat(element.price)
        })
        clientInvoiceTotal = parseFloat(subTotalFee).toFixed(2)
      }

      const orderRef = db.doc(`orders/${orderId}`)
      const orderUpdatedPromise = orderRef.update({
        ...(iterateItems && {
          clientInvoiceTotal,
        }),
        clientDiscount: document.discount,
        ...(document.invoiceNumber && {
          invoiceNumber: document.invoiceNumber,
        }),
        ...(document.completeDate && {
          invoiceDate: document.completeDate,
          invoiceCompletedDate: document.completeDate,
        }),
        ...(document.sentDate && {
          invoiceSentToClientDate: document.sentDate,
        }),
      })

      return orderUpdatedPromise
    }

    const document = change.after.exists ? change.after.data() : null
    if (!document) {
      return null
    }
    const user = document.updatedBy
    const oldDocument = change.before.exists ? change.before.data() : null
    const orderId = context.params.orderId
    const promises = []

    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping({ invoice: oldDocument }, { invoice: document }),
    }

    const historyRef = db.collection(`orders/${orderId}/history`)
    const historyUpdatePromise = historyRef.add(objToSave)
    promises.push(historyUpdatePromise)

    if (!oldDocument) {
      const orderUpdatedPromise = updateOrder({
        document,
        orderId,
        iterateItems: true,
      })
      promises.push(orderUpdatedPromise)
    }

    if (oldDocument) {
      // const hasOldItems = oldDocument.items && oldDocument.items.length
      const hasNewItems = document.items && document.items.length
      const hasItemsChanged = !compareItems(oldDocument.items, document.items)
      const hasDiscountChanged = oldDocument.discount !== document.discount
      const hasCompletedChanged =
        oldDocument.completeDate !== document.completeDate
      const hasSentToClientChanged = oldDocument.sentDate !== document.sentDate

      if (
        hasItemsChanged ||
        hasDiscountChanged ||
        hasNewItems ||
        hasCompletedChanged ||
        hasSentToClientChanged
      ) {
        const iterateItems =
          hasNewItems || hasItemsChanged || hasDiscountChanged
        const orderUpdatedPromise = updateOrder({
          document,
          orderId,
          iterateItems,
        })
        promises.push(orderUpdatedPromise)
      }
    }

    return Promise.all(promises)
  })
