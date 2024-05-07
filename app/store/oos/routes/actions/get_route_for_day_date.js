import { collection, query, where, onSnapshot } from 'firebase/firestore'

import { auth, db } from '~/plugins/firebase'

export function get_route_for_day_date(
  { state, commit, dispatch, rootState },
  forDateStr
) {
  if (!forDateStr) throw new Error('forDateStr is required')

  let firstLoad = false

  commit('set_loadingRoutes', true)

  if (state.listeners.length) {
    commit('flush_state')
  }

  const user = auth.currentUser

  const q = query(
    collection(db, 'routes'),
    where('forDateStr', '==', forDateStr)
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    firstLoad = true
    snapshot.docChanges().forEach((change) => {
      const docData = change.doc.data()
      const route = {
        ...docData,
        id: change.doc.id,
        orderListeners: [],
        ...(!docData.oosSupervisors && { oosSupervisors: [] }),
        notification: false,
      }

      const userIsOosSupervisor = route.oosSupervisors?.includes(user.uid)

      const usersToLoad = []

      if (route.oosSupervisors?.length) {
        usersToLoad.push(...route.oosSupervisors)
      }

      if (route.contractors?.length) {
        usersToLoad.push(...route.contractors)
      }

      if (usersToLoad.length) {
        dispatch(
          'users/get_usersById',
          { usersIds: usersToLoad },
          { root: true }
        )
      }

      if (change.type === 'added') {
        commit('add_route', route)
        if (userIsOosSupervisor) {
          dispatch('get_routesUpdates', { routeId: route.id })
          dispatch('get_requirements_for_route', { route })
          // dispatch(
          //   'oos/orders/get_ordersByRouteId',
          //   { orders: route.orders, routeId: route.id },
          //   { root: true }
          // ).catch((error) => {
          //   // eslint-disable-next-line
          //   console.error('Error getting orders:', error)
          // })
        }
        // dispatch(
        //   'oos/orders/get_ordersByRouteId',
        //   { orders: route.orders, routeId: route.id },
        //   { root: true }
        // ).catch((error) => {
        //   // eslint-disable-next-line
        //   console.error('Error getting orders:', error)
        // })
      }

      if (change.type === 'modified') {
        const indexOfRoute = state.routes.map((r) => r.id).indexOf(route.id)

        const oldOrdersR = state.routes[indexOfRoute].ordersR
        const newOrdersR = route.ordersR
        const ordersRComparison = compareOrdersR(oldOrdersR, newOrdersR)

        if (ordersRComparison.ordersToRemove.length) {
          ordersRComparison.ordersToRemove.forEach((orderId) => {
            commit(
              'oos/orders/flush_requirements_by_orderId',
              { orderId },
              { root: true }
            )
          })
        }

        if (ordersRComparison.ordersToAdd.length) {
          dispatch('get_requirements_for_route', { route })
        }

        if (ordersRComparison.taskToRemove.length) {
          ordersRComparison.taskToRemove.forEach((taskId) => {
            commit(
              'oos/orders/flush_requirement_by_taskId',
              { taskId },
              { root: true }
            )
          })
        }
        if (ordersRComparison.taskToAdd.length) {
          dispatch('get_requirements_for_route', { route })
        }

        if (
          indexOfRoute > -1 &&
          state.routes[indexOfRoute] &&
          !state.routes[indexOfRoute].oosSupervisors.includes(user.uid) &&
          route.oosSupervisors.includes(user.uid)
        ) {
          dispatch('get_routesUpdates', { routeId: route.id })
          dispatch('get_requirements_for_route', { route })
        }
        if (
          indexOfRoute > -1 &&
          state.routes[indexOfRoute] &&
          state.routes[indexOfRoute].oosSupervisors.includes(user.uid) &&
          !route.oosSupervisors.includes(user.uid)
        ) {
          // TODO: remove listeners for orders and jobTasks

          commit('flush_orders_in_route', { routeId: route.id })

          route.orders.forEach((order) => {
            commit('oos/orders/remove_order', order, { root: true })
          })
          commit(
            'oos/orders/flush_jobTaskListeners_for_orders',
            { orders: route.orders },
            { root: true }
          )
          commit('flush_routesUpdates', { routeId: route.id })
        }
        commit('update_route', route)
      }
      if (change.type === 'removed') {
        commit('flush_orders_in_route', { routeId: route.id })
        commit('flush_routesUpdates', { routeId: route.id })

        commit('remove_route', route.id)
      }
    })
    if (firstLoad) {
      commit('set_loadingRoutes', false)
    }
  })
  commit('add_listener', unsubscribe)
}

function compareOrdersR(oldOrdersR, newOrdersR) {
  let ordersToRemove = []
  let ordersToAdd = []
  let taskToRemove = []
  let taskToAdd = []

  function arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  if (!arraysEqual(Object.keys(oldOrdersR), Object.keys(newOrdersR))) {
    ordersToRemove = Object.keys(oldOrdersR).filter(
      (x) => !Object.keys(newOrdersR).includes(x)
    )
    ordersToAdd = Object.keys(newOrdersR).filter(
      (x) => !Object.keys(oldOrdersR).includes(x)
    )
  }

  Object.keys(newOrdersR).forEach((orderId) => {
    if (oldOrdersR[orderId]?.workToDos) {
      const workToDosToRemoveTemp = Object.keys(
        oldOrdersR[orderId].workToDos
      ).filter((x) => !Object.keys(newOrdersR[orderId].workToDos).includes(x))
      taskToRemove = [...taskToRemove, ...workToDosToRemoveTemp]
    }
    if (newOrdersR[orderId]?.workToDos) {
      const workToDosToAddTemp = Object.keys(
        newOrdersR[orderId].workToDos
      ).filter((x) => {
        if (!oldOrdersR[orderId]) return true

        return !Object.keys(oldOrdersR[orderId].workToDos).includes(x)
      })
      taskToAdd = [...taskToAdd, ...workToDosToAddTemp]
    }

    if (oldOrdersR[orderId]?.inspections) {
      const inspectionsToRemoveTemp = Object.keys(
        oldOrdersR[orderId].inspections
      ).filter((x) => {
        if (!newOrdersR[orderId]?.inspections) return true

        return !Object.keys(newOrdersR[orderId].inspections).includes(x)
      })
      taskToRemove = [...taskToRemove, ...inspectionsToRemoveTemp]
    }
    if (newOrdersR[orderId]?.inspections) {
      const inspectionsToAddTemp = Object.keys(
        newOrdersR[orderId].inspections
      ).filter((x) => {
        if (!oldOrdersR[orderId]?.inspections) return true
        return !Object.keys(oldOrdersR[orderId].inspections).includes(x)
      })
      taskToAdd = [...taskToAdd, ...inspectionsToAddTemp]
    }

    if (oldOrdersR[orderId]?.allowables) {
      const allowablesToRemoveTemp = Object.keys(
        oldOrdersR[orderId].allowables
      ).filter((x) => {
        if (newOrdersR[orderId]?.allowables) return true
        return !Object.keys(newOrdersR[orderId].allowables).includes(x)
      })
      taskToRemove = [...taskToRemove, ...allowablesToRemoveTemp]
    }
    if (newOrdersR[orderId]?.allowables) {
      const allowablesToAddTemp = Object.keys(
        newOrdersR[orderId].allowables
      ).filter((x) => {
        if (!oldOrdersR[orderId]?.allowables) return true
        return !Object.keys(oldOrdersR[orderId].allowables).includes(x)
      })
      taskToAdd = [...taskToAdd, ...allowablesToAddTemp]
    }
  })

  return {
    ordersToRemove,
    ordersToAdd,
    taskToRemove,
    taskToAdd,
  }
}
