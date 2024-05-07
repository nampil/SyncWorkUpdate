import { onAuthStateChanged } from 'firebase/auth'
import { isSupported } from 'firebase/messaging'
import { auth } from '~/plugins/firebase'

export function handleAuth({ commit, dispatch }) {
  const authListener = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // eslint-disable-next-line
      console.log('no user')
      dispatch('handle_logout')
    }

    commit('set_mainLoading', true, { root: true })

    const token = await auth.currentUser.getIdTokenResult()
    // || !token.claims.webAccess
    if (!token || !token.claims || token.claims.rol !== 'admin') {
      dispatch('handle_logout', true)

      this.$mainAlertError('Not authorized')
    }

    const { claims } = token
    // eslint-disable-next-line
    // console.log('claims', claims)
    const promises = []

    commit('set_user_credential', { ...user, claims })
    const userDataInStore = dispatch('get_userData', user.uid)
    promises.push(userDataInStore)
    const userPreferencesInStore = dispatch('get_preferences', user.uid)
    promises.push(userPreferencesInStore)
    const notificationInStore = dispatch('get_notifications', user.uid)
    promises.push(notificationInStore)
    const chatRoomsInStore = dispatch('chats/get_chatRooms', null, {
      root: true,
    })
    promises.push(chatRoomsInStore)

    await Promise.all(promises)

    isSupported()
      .then(() => {
        dispatch('handle_messagingPermission', user.uid)
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log('error in isSupperted: ', error)
      })

    commit('set_mainLoading', false, { root: true })
  })

  commit('set_authListener', authListener)
}
