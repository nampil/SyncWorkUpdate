import { arrayRemove, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function remove_oos_supervisor(_, { routeId, supervisorUid }) {
  const routeRef = doc(db, 'routes', routeId)

  return updateDoc(routeRef, {
    oosSupervisors: arrayRemove(supervisorUid),
  })
}
