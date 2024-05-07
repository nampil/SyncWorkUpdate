const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const { mapping } = require('../../../utils/mapping')

const { handleNotifications } = require('../../../utils/handleNotifications')

const db = admin.firestore()

exports.jobNotesOnWrite = functions.firestore
  .document('orders/{orderId}/jobNotes/{jobNoteId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) {
      // Documento Borrado
      return null
    }

    const promises = []

    if (!change.before.exists) {
      // Documento Creado

      const newDoc = change.after.data()

      if (newDoc.noteToUid && newDoc.noteToUid.length) {
        const notificationToUidsSent = sendNotification(
          newDoc.noteToUid,
          context.params.orderId,
          context.params.jobNoteId,
          newDoc.updatedBy
        )
        promises.push(notificationToUidsSent)
      }
    }

    if (change.before.exists && change.after.exists) {
      // Documento Actualizado
      const newDoc = change.after.data()
      const oldDoc = change.before.data()
      if (
        newDoc.noteToUid &&
        oldDoc.noteToUid &&
        JSON.stringify(newDoc.noteToUid) !== JSON.stringify(oldDoc.noteToUid)
      ) {
        const newUids = newDoc.noteToUid.filter(
          (uid) => !oldDoc.noteToUid.includes(uid)
        )
        if (newUids.length) {
          const notificationToNewUidsSent = sendNotification(
            newUids,
            context.params.orderId,
            context.params.jobNoteId,
            newDoc.updatedBy
          )
          promises.push(notificationToNewUidsSent)
        }
      }
    }

    async function sendNotification(list, orderId, jobNoteId, user) {
      const type = 'TAG_IN_JOB_NOTE'
      const link = `/dispatching/${orderId}?jnid=${jobNoteId}&drawer=jnd`
      const message = {
        title: 'You have been Tagged',
        body: `${user.fullName} tagged you in a job note`,
      }
      const users = list

      return handleNotifications({ users, type, message, link }, true)
    }

    // Updating Order History

    const document = change.after.data()
    const user = document.updatedBy
    const orderId = context.params.orderId
    const oldDocument = change.before.data()
    const objToSave = {
      user,
      updatedAt: document.updatedAt,
      changes: mapping({ jobNotes: oldDocument }, { jobNotes: document }),
    }
    const historyRef = db.collection(`orders/${orderId}/history`)
    const OrderHistoryUpdated = historyRef.add(objToSave)
    promises.push(OrderHistoryUpdated)

    // Return after all promises

    return Promise.all(promises)
  })
