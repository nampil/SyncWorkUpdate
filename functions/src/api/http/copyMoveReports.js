const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')

const storage = admin.storage()
const db = admin.firestore()

exports.copyMoveReports = functions.https.onCall(async (data, context) => {
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

  const { reports, isCopy, isMove } = data

  if (!reports || !reports.length || (!isCopy && !isMove)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'No necesary data'
    )
  }

  try {
    const bucket = storage.bucket()

    const promises = []

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index]
      const destinationPath = `orders/${report.destination.orderId}/${report.destination.taskType}/${report.destination.taskId}/reports/${report.destination.newCodeName}`
      const copyDestination = bucket.file(destinationPath)

      try {
        await bucket.file(report.path).copy(copyDestination, {
          metadata: {
            reportInfo: report.reportInfo,
          },
        })
      } catch (error) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Fail to copy file'
        )
      }

      if (isMove) {
        const deletedFile = bucket
          .file(report.path)
          .delete()
          .catch((error) => {
            console.error('Error al borrar file' + error)
            throw new functions.https.HttpsError(
              'failed-precondition',
              'Fail to delete file'
            )
          })
        promises.push(deletedFile)
        const oldReportRef = db.doc(report.path)
        const oldReporDeleted = oldReportRef.delete().catch((error) => {
          console.error('Error al borrar report' + error)
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Fail to delete report'
          )
        })
        promises.push(oldReporDeleted)
      }
    }
    await Promise.all(promises)
    return
  } catch (error) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Fail to copy or move reports'
    )
  }
})
