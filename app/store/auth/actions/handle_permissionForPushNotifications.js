import { getMessaging, getToken, isSupported } from 'firebase/messaging'

export async function handle_permissionForPushNotifications({
  commit,
  dispatch,
}) {
  let messaging = null
  isSupported()
    .then(() => {
      messaging = getMessaging()
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.log('error: ', error)
    })
  Notification.requestPermission()
    .then((permission) => {
      if (permission === 'granted') {
        commit('set_askForPermissionForNotifications', false)
      }
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.log('error:', error)
      commit('set_askForPermissionForNotifications', true)
    })

  const currentToken = await getToken(messaging, {
    vapidKey: process.env.vapidKey,
  })
  if (currentToken) {
    await dispatch('sendNotificationToken', currentToken)
    commit('set_askForPermissionForNotifications', false)
  } else {
    // Show permission request UI
    commit('set_askForPermissionForNotifications', true)
  }
}
