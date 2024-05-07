const { onRequest, HttpsError } = require('firebase-functions/v2/https')
const { admin } = require('../../utils/admin')
const { handleNotifications } = require('../../utils/handleNotifications')
const db = admin.firestore()

exports.remindernotification = onRequest(
  { maxInstances: 10, cors: true },
  async (req, res) => {
    const data = JSON.parse(req.body)
    const { users, message, type } = data

    const { title, body } = message

    const newTitle = `Reminder: ${title}`
    const newBody = `Reminder: ${body}`

    const objToSend = {
      users,
      message: { title: newTitle, body: newBody },
      type,
    }

    await handleNotifications(objToSend, true)
    res.status(200).send()
  }
)
