import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export async function save_routes(
  { state, rootState, commit, dispatch },
  { baseOrders }
) {
  const batch = writeBatch(db)

  for (let index = 0; index < state.routes.length; index++) {
    const route = state.routes[index]
    let routeRef = null

    const _route = {
      ...route,
      files: [...route.files],
      rowFiles: [...route.rowFiles],
      groupName: route.groupName || null,
      createdAt: route.createdAt || serverTimestamp(),
      ...(route.createdAt && { editedAt: serverTimestamp() }),
    }
    const orders = _route.orders
    const ordersInStore = baseOrders.filter(({ id }) => orders.includes(id))

    ordersInStore.forEach(async (o) => {
      const objectToSend = {
        contractorsUids: _route.contractors || [],
        contractor: _route.contractorsProfiles || [],
        assigned: _route.contractors.length > 0,
        contractorsCrew: route.groupName || '',
      }

      await dispatch(
        'order/update_order',
        {
          orderId: o.id,
          objectToSend,
        },
        { root: true }
      )
    })

    if (isNaN(_route.id)) {
      routeRef = doc(db, 'routes', _route.id)
    } else {
      routeRef = doc(collection(db, 'routes'))
    }

    if (_route.rowFiles && _route.rowFiles.length) {
      const _files = await dispatch('upload_files_for_routes', {
        files: _route.rowFiles,
        routeId: isNaN(_route.id) ? _route.id : routeRef.id,
      })

      _files.forEach((file) => {
        const index = _route.files.map((f) => f.codeName).indexOf(file.codeName)

        if (index < 0) {
          _route.files.push(file)
        } else {
          _route.files.splice(index, 1, file)
        }
      })
    }

    const { rowFiles, id, contractorsProfiles, ...objToSend } = _route

    batch.set(routeRef, objToSend, { merge: true })
  }

  await batch.commit()

  for (let index = 0; index < state.routes.length; index++) {
    const route = state.routes[index]
    if (!isNaN(route.id)) {
      commit('remove_route', route.id)
    }
  }
}
