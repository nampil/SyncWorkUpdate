const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')
const db = admin.firestore()
const { handleNotifications } = require('../../../utils/handleNotifications')

const {
  GENERAL_ORDER_STATUS,
  ORDER_STATUS,
  ORDER_SUB_STATUS_BY_GENERAL_STATUS,
  JOB_NOTES_TYPES,
} = require('../../../utils/dictionary')

exports.ordersOnWrite = functions.firestore
  .document('orders/{orderId}')
  .onWrite(async (change, context) => {
    function isDocumentInvoiceChanged(oldDocument, document) {
      return (
        oldDocument.clientInvoiceTotal !== document.clientInvoiceTotal ||
        oldDocument.clientDiscount !== document.clientDiscount ||
        oldDocument.invoiceNumber !== document.invoiceNumber ||
        oldDocument.invoiceDate !== document.invoiceDate ||
        oldDocument.invoiceCompletedDate !== document.invoiceCompletedDate ||
        oldDocument.invoiceSentToClientDate !== document.invoiceSentToClientDate
      )
    }
    try {
      const promises = []
      const document = change.after.exists ? change.after.data() : null
      const oldDocument = change.after.exists ? change.before.data() : null

      // Handle cases where we do nothing
      if (!document) {
        // the order was deleted
        return null
      }

      const user = document.updatedBy || null
      const orderId = context.params.orderId

      // the order was created
      if (!oldDocument) {
        // Handle create chatRoom for this (new) order

        const adminsRef = db.collection('users').where('rol', '==', 'admin')
        const admins = await adminsRef.get().then((querySnapshot) => {
          const _adminUids = []
          querySnapshot.forEach((doc) => {
            _adminUids.push(doc.id)
          })
          return _adminUids
        })
        const chatRef = db.collection('chatRooms').doc()

        const chatRoom = {
          name: document.woNumber,
          admins: admins,
          cretatedBy: { fullName: 'Admin' },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          roomImg: document.fohImg,
          isGroup: true,
          isOrderChat: true,
          orderId,
          subscribers: admins,
          active: false,
        }
        await chatRef.set(chatRoom)
        const updatedOrder = change.after.ref.update({
          chatRoomId: chatRef.id,
        })

        promises.push(updatedOrder)
      }

      if (oldDocument) {
        if (document.generalStatus !== oldDocument.generalStatus) {
          return null
        }

        if (!oldDocument.chatRoomId && document.chatRoomId) {
          return null
        }

        if (isDocumentInvoiceChanged(oldDocument, document)) {
          return null
        }

        if (
          oldDocument.clientInvoicePayment !== document.clientInvoicePayment
        ) {
          return null
        }

        // handleUpdate

        // handle updated propertyId
        if (oldDocument.propertyId !== document.propertyId) {
          const bidRefs = db.collection(`orders/${orderId}/bids`)
          const jobNoteRefs = db
            .collection(`orders/${orderId}/jobNotes`)
            .where('noteType', '==', JOB_NOTES_TYPES.propertyNotes)
          const batch = db.batch()

          const bidOnBatch = bidRefs.get().then((querySnapshot) => {
            if (querySnapshot.empty) {
              return
            }
            querySnapshot.forEach((doc) => {
              batch.update(doc.ref, { propertyId: document.propertyId })
            })
          })

          const jobNotesOnBatch = jobNoteRefs.get().then((querySnapshot) => {
            if (querySnapshot.empty) {
              return
            }
            querySnapshot.forEach((doc) => {
              batch.update(doc.ref, { propertyId: document.propertyId })
            })
          })

          await Promise.all([bidOnBatch, jobNotesOnBatch])
          const batchCompleted = batch.commit()
          promises.push(batchCompleted)
        }

        // handle updated contractors
        if (
          JSON.stringify(oldDocument.contractorsUids) !==
          JSON.stringify(document.contractorsUids)
        ) {
          const adminsRef = db.collection('users').where('rol', '==', 'admin')
          const admins = await adminsRef.get().then((querySnapshot) => {
            const _adminUids = []
            querySnapshot.forEach((doc) => {
              _adminUids.push(doc.id)
            })
            return _adminUids
          })
          const _subscribers = admins.concat(document.contractorsUids)

          const chatRoomRef = db.doc(`chatRooms/${document.chatRoomId}/`)
          const updatedChatRoom = chatRoomRef.update({
            subscribers: _subscribers,
          })
          promises.push(updatedChatRoom)
        }

        // Handle update processor
        if (
          JSON.stringify(oldDocument.processor) !==
          JSON.stringify(document.processor)
        ) {
          if (document.processor) {
            const userRef = db.doc(`users/${document.processor}`)
            const user = await userRef.get().then((doc) => doc.data())

            const message = {
              title: 'Order Assigned',
              body: `${
                user?.name ?? 'You'
              } has been assigned as processor for order #${document.woNumber}`,
            }

            const notifyUser = handleNotifications(
              {
                users: [document.processor],
                message,
                icon: user?.avatar?.url || '',
                link: `/dispatching//${orderId}`,
                type: 'ORDER_PROCESSOR_ASSIGNED',
              },
              true
            )

            promises.push(notifyUser)
          }
        }

        if (oldDocument.status !== document.status) {
          let generalStatus = document.generalStatus || ''
          const status = document.status || ''

          const generalStatusOptions = Object.values(GENERAL_ORDER_STATUS).map(
            (option) => option.toLowerCase()
          )

          if (generalStatusOptions.includes(status.toLowerCase())) {
            generalStatus = document.status
          } else if (
            status.toLowerCase() ===
            ORDER_STATUS.partiallyCompleted.toLowerCase()
          ) {
            generalStatus = GENERAL_ORDER_STATUS.unassigned
          } else {
            let generalStatusToBe

            for (const [key, value] of Object.entries(
              ORDER_SUB_STATUS_BY_GENERAL_STATUS
            )) {
              if (
                value.map((v) => v.toLowerCase()).includes(status.toLowerCase())
              ) {
                generalStatusToBe = key
                break
              }
            }

            if (generalStatusToBe && generalStatusToBe !== generalStatus) {
              generalStatus = generalStatusToBe
            }
          }

          const updatedOrder = change.after.ref.update({
            generalStatus,
          })
          promises.push(updatedOrder)
        }

        if (
          oldDocument.status !== document.status ||
          oldDocument.dateDueStr !== document.dateDueStr ||
          oldDocument.isReopen !== document.isReopen
        ) {
          const serverTime = new Date()
          const nyDate = serverTime.toLocaleString('en-US', {
            timeZone: 'America/New_York',
          })
          const nyTime = new Date(nyDate)

          const dateNYStr =
            nyTime.getFullYear().toString() +
            '-' +
            (nyTime.getMonth() + 1).toString().padStart(2, '0') +
            '-' +
            nyTime.getDate().toString().padStart(2, '0')

          const routesRef = db
            .collection('routes')
            .where('forDateStr', '==', dateNYStr)
            .where('orders', 'array-contains', orderId)
          const routesCountSnap = await routesRef.count().get()

          const hasRoutes = routesCountSnap.data().count > 0

          if (hasRoutes) {
            let dateDueStr = document.dateDueStr
            const dateDue = document.dateDue
            if (
              !dateDueStr &&
              dateDue &&
              typeof dateDue.toDate === 'function'
            ) {
              dateDueStr =
                dateDue.toDate().getFullYear().toString() +
                '-' +
                (dateDue.toDate().getMonth() + 1).toString().padStart(2, '0') +
                '-' +
                dateDue.toDate().getDate().toString().padStart(2, '0')
            }

            const routesSnap = await routesRef.get()

            routesSnap.forEach((doc) => {
              const routeRef = doc.ref

              const routeUpdated = routeRef.update({
                [`ordersR.${orderId}.status`]: document.status,
                [`ordersR.${orderId}.woNumber`]: document.woNumber,
                [`ordersR.${orderId}.dateDueStr`]: document.dateDueStr || '',
                [`ordersR.${orderId}.isReopen`]: document.isReopen || false,
              })
              promises.push(routeUpdated)
            })
          }
        }
      }

      // Handle Order History
      const objToSave = {
        user,
        updatedAt:
          document.updatedAt || admin.firestore.FieldValue.serverTimestamp(),
        changes: mapping(oldDocument, document),
      }
      const historyRef = db.collection(`orders/${orderId}/history`)
      const historyUpdated = historyRef.add(objToSave)

      promises.push(historyUpdated)

      // Handle All Promises
      const results = await Promise.all(promises)
      return results
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
      throw error
    }
  })
