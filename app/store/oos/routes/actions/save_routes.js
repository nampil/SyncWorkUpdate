import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function save_routes(
  { dispatch, rootState },
  { routes, routesDelete }
) {
  const user = rootState.auth.user.profile
  const _contractorsList = await dispatch('get_contractors', null, {
    root: true,
  })
  const batch = writeBatch(db)

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index]
    let routeRef = null
    const _contractors = _contractorsList.filter((c) =>
      route.contractors.includes(c.uid)
    )

    if (isNaN(route.id)) {
      routeRef = doc(db, 'routes', route.id)
    } else {
      routeRef = doc(collection(db, 'routes'))
    }

    dispatch('update_orders', {
      contractorsUids: route.contractors,
      orders: route.orders,
      contractors: _contractors,
      contractorsCrew: route.groupName || '',
    })

    const { orderListeners, rowFiles, notification, ..._route } = route

    batch.set(routeRef, {
      ..._route,
      id: routeRef.id,
      createdAt:
        route.createdAt &&
        route.createdAt.seconds &&
        route.createdAt.nanoseconds
          ? new Timestamp(route.createdAt.seconds, route.createdAt.nanoseconds)
          : serverTimestamp(),
      editedAt:
        route.editedAt && route.editedAt.seconds && route.editedAt.nanoseconds
          ? new Timestamp(route.editedAt.seconds, route.editedAt.nanoseconds)
          : serverTimestamp(),
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })
  }
  if (routesDelete.length) {
    dispatch('delete_routes', routesDelete)
  }
  return batch.commit()
}
