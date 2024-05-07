const functions = require('firebase-functions')
const { admin } = require('../../../../utils/admin')

const db = admin.firestore()

exports.itemsForInvoiceTemplatesOnWrite = functions.firestore
  .document('admin/config/itemsForInvoices-templates/{itemId}')
  .onWrite(async (change, context) => {
    const itemId = context.params.itemId
    const document = change.after.exists ? change.after.data() : null
    const oldDocument = change.before.exists ? change.before.data() : null

    if (!oldDocument && document) {
      // Item Created
      if (document.workTemplateId) {
        const workTemplateRef = db.doc(
          `admin/config/workToDos-templates/${document.workTemplateId}`
        )

        return workTemplateRef.set(
          {
            itemsForInvoiceTemplateIds:
              admin.firestore.FieldValue.arrayUnion(itemId),
          },
          { merge: true }
        )
      }
      return null
    }

    if (oldDocument && !document) {
      // Item Deleted
      if (oldDocument.workTemplateId) {
        const workTemplateRef = db.doc(
          `admin/config/workToDos-templates/${oldDocument.workTemplateId}`
        )

        return workTemplateRef.set(
          {
            itemsForInvoiceTemplateIds:
              admin.firestore.FieldValue.arrayRemove(itemId),
          },
          { merge: true }
        )
      }

      return null
    }

    if (oldDocument && document) {
      // Item updated
      if (oldDocument.workTemplateId === document.workTemplateId) {
        return null
      }

      const batch = db.batch()

      if (oldDocument.workTemplateId) {
        const workTemplateRef = db.doc(
          `admin/config/workToDos-templates/${oldDocument.workTemplateId}`
        )

        batch.set(
          workTemplateRef,
          {
            itemsForInvoiceTemplateIds:
              admin.firestore.FieldValue.arrayRemove(itemId),
          },
          { merge: true }
        )
      }
      if (document.workTemplateId) {
        const workTemplateRef = db.doc(
          `admin/config/workToDos-templates/${document.workTemplateId}`
        )

        batch.set(
          workTemplateRef,
          {
            itemsForInvoiceTemplateIds:
              admin.firestore.FieldValue.arrayUnion(itemId),
          },
          { merge: true }
        )
      }

      return batch.commit()
    }

    return null
  })
