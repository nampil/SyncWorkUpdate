export default {
  set_user_credential(state, authUser) {
    const { displayName, email, emailVerified, photoURL, uid, claims } =
      authUser

    state.user.userCredential = {
      displayName,
      email,
      emailVerified,
      photoURL,
      uid,
      claims: {
        rol: claims.rol,
        authLevel: claims.authLevel,
        appAccess: claims.appAccess,
        webAccess: claims.webAccess,
      },
    }
  },
  set_user_profile(state, payload) {
    const { name, lastName, fullName, email, uid, avatar } = payload
    state.user.profile.name = name
    state.user.profile.lastName = lastName
    state.user.profile.fullName = fullName
    state.user.profile.email = email
    state.user.profile.uid = uid

    state.user.profile.avatar = avatar || null
  },
  set_preferences(state, userPreferences) {
    state.user.preferences = {
      ...state.user.preferences,
      ...userPreferences,
    }
  },
  set_ordersFilters(state, payload) {
    state.user.preferences.ordersFilters = payload
  },
  set_headersTable(state, headers) {
    state.user.preferences.headers = headers
  },
  update_userProfileLanguage(state, payload) {
    state.user.preferences.language = payload
  },
  update_user_profile(state, payload) {
    const profileState = state.user.profile
    const nuevoProfile = { ...profileState, ...payload }
    state.user.profile = nuevoProfile
  },

  set_askForPermissionForNotifications(state, payload) {
    state.askForPermissionForNotifications = payload
  },

  add_notification(state, notification) {
    state.notifications.unshift(notification)
  },

  update_notification(state, newNotification) {
    const indexOfOldNotification = state.notifications.findIndex(
      (noti) => noti.id === newNotification.id
    )

    state.notifications.splice(indexOfOldNotification, 1, newNotification)
  },

  delete_notification(state, notiId) {
    const indexOfOldNotification = state.notifications.findIndex(
      (noti) => noti.id === notiId
    )
    state.notifications.splice(indexOfOldNotification, 1)
  },

  set_notificationsListener(state, listener) {
    state.notificationsListener = listener
  },
  set_authListener(state, authListener) {
    state.authListener = authListener
  },

  add_user(state, user) {
    state.users.push(user)
  },
  update_user(state, user) {
    const idx = state.users.findIndex((u) => u.uid === user.uid)
    if (idx > -1) state.users.splice(idx, 1, user)
  },
  delete_user(state, user) {
    const idx = state.users.findIndex((u) => u.uid === user.uid)
    if (idx > -1) state.users.splice(idx, 1)
  },

  logout(state) {
    state.user.profile.name = ''
    state.user.profile.lastName = ''
    state.user.profile.fullName = ''
    state.user.profile.email = ''
    state.user.profile.uid = ''
    state.user.profile.avatar = {}
    state.user.userCredential.displayName = ''
    state.user.userCredential.email = ''
    state.user.userCredential.emailVerified = ''
    state.user.userCredential.photoURL = ''
    state.user.userCredential.uid = ''
    state.user.userCredential.claims = {}
    state.askForPermissionForNotifications = false
    state.notifications = []
    if (state.notificationsListener) {
      state.notificationsListener()
    }
    if (state.authListener) {
      state.authListener()
      state.authListener = null
    }
  },
}
