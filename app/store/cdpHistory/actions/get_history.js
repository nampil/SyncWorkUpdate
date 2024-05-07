import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'

import { db } from '~/plugins/firebase'

export async function get_history({ commit, dispatch }, { date }) {
  commit('clear_history')

  // Get all the dates between the start and end date
  const [fyear, fmonth, fday] = date.split('-')

  const date1 = new Date(fyear, parseFloat(fmonth) - 1, fday)
  const forDateStr = date1.toISOString().split('T')[0]

  // eslint-disable-next-line
  console.log('forDateStr', forDateStr)

  const routesRef = collection(db, 'routes')

  const q = query(routesRef, where('forDateStr', '==', forDateStr))
  const routes = []
  const usersToLoad = []
  await getDocs(q).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().oosSupervisors?.length) {
        usersToLoad.push(...doc.data().oosSupervisors)
      }

      if (doc.data().contractors?.length) {
        usersToLoad.push(...doc.data().contractors)
      }

      const routesUpdatesRef = collection(db, `routes/${doc.id}/routesUpdates`)
      const q = query(routesUpdatesRef, orderBy('updatedAt', 'desc'))

      getDocs(q).then((querySnapshot) => {
        const routesUpdates = []
        querySnapshot.forEach((doc) => {
          routesUpdates.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        commit('add_routeUpdates', { routeId: doc.id, routesUpdates })
      })

      routes.push({
        ...doc.data(),
        id: doc.id,
        // routesUpdates,
      })
    })

    if (usersToLoad.length) {
      const usersIds = [...new Set(usersToLoad)]

      dispatch('users/get_usersById', { usersIds }, { root: true })
    }
  })
  commit('add_history', { routes })
  return null
}
