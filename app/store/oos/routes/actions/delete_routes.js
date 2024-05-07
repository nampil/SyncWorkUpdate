import { doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function delete_routes(_, routesDelete) {
  const batch = writeBatch(db)
  for (let index = 0; index < routesDelete.length; index++) {
    const route = routesDelete[index]
    let routeRef = null
    if (isNaN(route)) {
      routeRef = doc(db, 'routes', route)
      batch.delete(routeRef)
    }
  }
  return batch.commit()
}
