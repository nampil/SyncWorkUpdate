import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export async function delete_route(_, routeId) {
  const routeRef = doc(db, 'routes', routeId)
  await deleteDoc(routeRef)
}
