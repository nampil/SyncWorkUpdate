import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function handle_user_as_supervisor({ rootState }, { routeId, remove }) {
  const user = rootState.auth.user.profile

  const routeRef = doc(db, 'routes', routeId)
  const objectToUpdate = {
    oosSupervisors: remove ? arrayRemove(user.uid) : arrayUnion(user.uid),
  }

  return updateDoc(routeRef, objectToUpdate)
}
