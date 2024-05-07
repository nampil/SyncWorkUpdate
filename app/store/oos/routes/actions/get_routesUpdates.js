import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore'
import { orderBy } from 'lodash'
import { db } from '~/plugins/firebase'

export function get_routesUpdates({ commit, dispatch }, { routeId }) {
  const routesUpdatesRef = collection(db, `routes/${routeId}/routesUpdates`)
  const q = query(routesUpdatesRef, orderBy('updatedAt', 'desc'))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docData = change.doc.data()
      const routeUpdate = {
        ...docData,
        id: change.doc.id,
        ...(!docData.updatedAt && { updatedAt: Timestamp.now() }),
      }

      if (change.type === 'added') {
        commit('add_routeUpdate', { update: routeUpdate, routeId })
        dispatch(
          'users/get_usersById',
          { usersIds: [routeUpdate.updatedBy] },
          { root: true }
        )
      }
      if (change.type === 'modified') {
        commit('update_routeUpdate', { update: routeUpdate, routeId })
      }
      if (change.type === 'removed') {
        commit('remove_routeUpdate', { update: routeUpdate, routeId })
      }
    })
  })

  commit('add_routeUpdates_listener', { routeId, unsubscribe })
}
