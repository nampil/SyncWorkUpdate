export default () => ({
  askForPermissionForNotifications: false,
  notifications: [],
  notificationsListener: null,
  authListener: null,
  user: {
    userCredential: {
      displayName: '',
      email: '',
      emailVerified: false,
      photoURL: '',
      uid: '',
      claims: null,
    },
    profile: {
      name: '',
      lastName: '',
      fullName: '',
      email: '',
      uid: '',
      avatar: null,
    },
    preferences: {
      ordersFilters: null,
      language: 'en',
      headers: [],
    },
  },
  users: [],
})
