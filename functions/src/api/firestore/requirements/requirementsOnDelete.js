const functions = require('firebase-functions')
const { admin } = require('../../../utils/admin')
const storage = admin.storage()

exports.requirementsOnDelete = functions.firestore
  .document('orders/{orderId}/{taskType}/{taskId}/requirements/{requirementId}')
  .onDelete(async (snap, context) => {
    if (!snap.data().pictures.length) return null

    const picturesToDelete = snap.data().pictures
    const promises = []

    const bucket = storage.bucket()

    picturesToDelete.forEach((pic) => {
      const picUrl = new URL(pic.url)
      const pathNameFormatted = decodeURIComponent(picUrl.pathname)
      const [__, path] = pathNameFormatted.split('/o/')

      const fileRef = bucket.file(path)

      const promise = fileRef.delete()

      promises.push(promise)
    })

    return Promise.all(promises)
  })
