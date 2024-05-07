import { httpsCallable } from 'firebase/functions'
import { functions } from '~/plugins/firebase'

export async function sendMessage(
  _,
  { users, message, type, sendMessageInApp, extraData }
) {
  const sendNotificationToUser = httpsCallable(
    functions,
    'sendnotificationtouser'
  )
  const objToSend = {
    users,
    message,
    type,
    sendMessageInApp,
    extraData,
  }

  const res = await sendNotificationToUser(objToSend)

  return res
}
