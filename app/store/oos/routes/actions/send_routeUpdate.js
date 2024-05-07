import { collection, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function send_routeUpdate({ rootState }, { routeId, text }) {
  const user = rootState.auth.user.profile

  const update = {
    text,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  }
  const routesUpdatesRef = collection(db, `routes/${routeId}/routesUpdates`)
  return addDoc(routesUpdatesRef, update)
}
