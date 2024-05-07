import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

export default (_, inject) => {
  function notifyUsers(payload) {
    const notifyUserFunc = httpsCallable(functions, 'sendnotificationtouser')

    return notifyUserFunc(payload)
  }
  inject('notifyUsers', (payload) => notifyUsers(payload))
}
