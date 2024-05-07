export function handle_messagingPermission({ commit, dispatch }, uid) {
  try {
    // eslint-disable-next-line
    const permission = Notification.permission

    if (permission === 'granted') {
      commit('set_askForPermissionForNotifications', false)
      // dispatch('handle_permissionForPushNotifications')
      return
    }

    commit('set_askForPermissionForNotifications', true)
  } catch (error) {
    // eslint-disable-next-line
    console.log('error handle messaging: ', error)
  }
}
