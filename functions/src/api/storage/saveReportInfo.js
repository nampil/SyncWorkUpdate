const { admin } = require('../../utils/admin')

const { onObjectFinalized } = require('firebase-functions/v2/storage')
const { getDownloadURL } = require('firebase-admin/storage')
// const logger = require('firebase-functions/logger')

exports.saveReportInfo = onObjectFinalized(
  { cpu: 'gcf_gen1', maxInstances: 10 },
  async (event) => {
    const filePath = event.data.name

    const [orderFolder, orderId, taskType, taskId, reportsFolder, fileName] =
      filePath.split('/')

    if (reportsFolder !== 'reports') {
      return null
    }
    const db = admin.firestore()
    const storage = admin.storage()

    const metadata = event.data.metadata

    const reportInfo = JSON.parse(metadata.reportInfo)

    const fileRef = storage.bucket().file(filePath)

    const url = await getDownloadURL(fileRef)

    const objectToSend = {
      ...reportInfo,
      url,
      uploaded: true,
      filePathPreview: null,
      filePath: null,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const ref = db.doc(
      `${orderFolder}/${orderId}/${taskType}/${taskId}/${reportsFolder}/${reportInfo.id}`
    )

    return ref.set(objectToSend, { merge: true })
  }
)
