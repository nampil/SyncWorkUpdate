const { onCall, HttpsError } = require('firebase-functions/v2/https')

const { admin } = require('../../utils/admin')
const { handleNotifications } = require('../../utils/handleNotifications')
const db = admin.firestore()
const { CloudTasksClient } = require('@google-cloud/tasks')

const { projectID, defineString } = require('firebase-functions/params')

const funcLocation = defineString('FUNC_LOCATION', { default: 'us-central1' })
const reminderNotificationQueue = defineString('REMINDER_NOTIFICATION_QUEUE', {
  default: 'reminderNotifications',
})
const reminderNotificationUrl = defineString('REMINDER_NOTIFICATION_URL')

exports.sendnotificationtouser = onCall(
  { maxInstances: 10, cors: true },
  async ({ auth, data }) => {
    const authAdminLevel = parseInt(auth.token.adminLevel)

    if (authAdminLevel < 6) {
      throw new HttpsError('permission-denied', 'Unauthorized')
    }

    const {
      users,
      message,
      type,
      sendMessageInApp,
      reportId,
      extraData,
      link,
    } = data

    if (!users.length || !message.title || !message.body) {
      throw new HttpsError('invalid-argument', 'All field are required')
    }

    const promises = []
    let _extraData = null
    let _link = link || null

    if (extraData) {
      _extraData = JSON.parse(extraData)
    }

    if (_extraData && _extraData.needReminder) {
      const project = projectID.value()
      const location = funcLocation.value()
      const queue = reminderNotificationQueue.value()
      const url = reminderNotificationUrl.value()
      const payload = {
        users,
        message,
        type,
      }
      const notificationAtSeconds = _extraData.reminderAtSeconds
      const tasksClient = new CloudTasksClient()
      const parent = tasksClient.queuePath(project, location, queue)
      const task = {
        httpRequest: {
          httpMethod: 'POST',
          url,

          headers: {
            'Content-Type': 'text/plain',
          },
        },
        scheduleTime: {
          seconds: notificationAtSeconds,
        },
      }

      if (payload) {
        task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
          'base64'
        )
      }

      if (notificationAtSeconds) {
        task.scheduleTime.seconds = notificationAtSeconds
      }

      const request = { parent, task }

      promises.push(tasksClient.createTask(request))
    }

    if (sendMessageInApp) {
      const batch = db.batch()

      for (let index = 0; index < users.length; index++) {
        const user = users[index]

        const notificationsRef = db
          .collection(`users/${user}/notifications`)
          .doc()

        _link = `?notiId=${notificationsRef.id}`

        batch.set(notificationsRef, {
          ...message,
          read: false,
          ...(type && { type }),
          ...(_link && { link: _link }),
          ...(extraData && { extraData }),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
      const sendNotifications = batch.commit()

      promises.push(sendNotifications)
    }

    const sendPushNotifications = handleNotifications(
      { users, message, type, link: _link, reportId, extraData },
      false
    )

    promises.push(sendPushNotifications)

    return Promise.all(promises)
  }
)
