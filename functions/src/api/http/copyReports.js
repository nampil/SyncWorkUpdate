const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')

const storage = admin.storage()
const db = admin.firestore()

exports.copyReports = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  const authAdminLevel = parseInt(context.auth.token.adminLevel)

  if (authAdminLevel < 7) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authorized.'
    )
  }

  const { reports } = data

  if (!reports || !reports.length) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'No necesary data'
    )
  }

  const bucket = storage.bucket()

  const promises = []

  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const destinationPath = `orders/${report.destination.orderId}/${report.destination.taskType}/${report.destination.taskId}/reports/${report.destination.newCodeName}`
    const copyDestination = bucket.file(destinationPath)
    await bucket.file(report.path).copy(copyDestination)

    const newFile = bucket.file(destinationPath)
    const metadata = await newFile.getMetadata()
    const downloadToken = metadata[0].metadata.firebaseStorageDownloadTokens

    const persistentDownloadUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(destinationPath)}?alt=media&token=${downloadToken}`

    const newReportRef = db.doc(destinationPath)
    const promise = newReportRef.set(
      {
        url: persistentDownloadUrl,
        uploded: true,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    promises.push(promise)
  }
  return Promise.all(promises)
})
