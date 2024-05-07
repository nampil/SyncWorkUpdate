const functions = require('firebase-functions')
const { admin } = require('../../utils/admin')

const storage = admin.storage()

exports.copyFiles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You are not authenticated'
    )
  }

  const authAdminLevel = parseInt(context.auth.token.adminLevel)

  if (authAdminLevel < 7) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authorized.'
    )
  }

  const { files } = data

  if (!files || !files.length) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'No necesary data'
    )
  }

  const promises = []

  for (let idx = 0; idx < files.length; idx++) {
    const _file = files[idx]

    const { bucketName, path, destinationPath, destinationBucketName } = _file

    const originalBucket = storage.bucket(bucketName)
    const originalFile = originalBucket.file(path)

    if (!originalFile) {
      continue
    }

    const destinationBucket = storage.bucket(destinationBucketName)

    const copyDestination = destinationBucket.file(destinationPath)
    const copyPromise = originalFile.copy(copyDestination)

    promises.push(copyPromise)
  }

  const results = await Promise.all(promises)
  return results
}) // End function
