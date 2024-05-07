const functions = require('firebase-functions')

exports.workToDosTemplatesOnUpdate = functions.firestore
  .document('admin/config/workToDos-templates/{itemId}')
  .onUpdate((change, context) => {
    const newDocument = change.after.data()

    if (
      newDocument.itemsForInvoiceTemplateIds &&
      !newDocument.itemsForInvoiceTemplateIds.length
    ) {
      return change.after.ref.delete()
    }
    return null
  })
