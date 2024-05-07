import { JOB_TYPES } from '~/utils/dictionaries'

export default {
  getReportsSelectedByTaskId:
    (state) =>
    ({ taskId, orderId, type }) => {
      if (!taskId || !orderId || !type) {
        return []
      }
      const indexOfOrder = state.orders.findIndex((o) => o.id === orderId)
      if (indexOfOrder === -1) {
        return
      }
      const order = state.orders[indexOfOrder]
      const taskType = order[type]

      const indexOfTask = taskType.findIndex((task) => task.id === taskId)
      if (indexOfTask === -1) {
        return
      }

      const task = taskType[indexOfTask]
      return task.reportsSelected
    },
  getTaskSelect(state, getters, rootState) {
    const taskSelected = state.taskSelected

    if (!taskSelected) {
      return null
    }
    const orderId = rootState.oos.routes.selectOrder

    const indexOfOrder = state.orders.findIndex((o) => o.id === orderId)
    // eslint-disable-next-line
    console.log('Order Index', indexOfOrder)
    if (indexOfOrder === -1) {
      return null
    }
    const order = state.orders[indexOfOrder]
    // eslint-disable-next-line
    console.log('order', order)

    const tasks = []
    const jobTypes = [
      JOB_TYPES.allowables,
      JOB_TYPES.allowablesPools,
      JOB_TYPES.inspections,
      JOB_TYPES.workToDos,
    ]

    for (let i = 0; i < jobTypes.length; i++) {
      const _type = jobTypes[i]
      // eslint-disable-next-line
      console.log('order[_type]', order[_type])

      if (!order[_type]) continue

      tasks.push(...order[_type])
    }
    // eslint-disable-next-line
    console.log('tasks', tasks)

    if (!tasks.length) {
      return null
    }
    const indexOfTask = tasks.findIndex((t) => t.id === taskSelected)
    if (indexOfTask < 0) {
      return null
    }

    return tasks[indexOfTask]
  },
  getOrderSelected: (state) => (orderId) => {
    return state.orders.find((order) => order.id === orderId)
  },
  get_requirementsLastPosition:
    (state) =>
    ({ taskId, type, orderId }) => {
      const indexOfOrder = state.orders.map((o) => o.id).indexOf(orderId)
      const indexOfTask = state.orders[indexOfOrder][type]
        .map((t) => t.id)
        .indexOf(taskId)
      const requirements =
        state.orders[indexOfOrder][type][indexOfTask].requirements

      if (!requirements.length) {
        return 1
      }

      const result = requirements.reduce((acc, req) => {
        if (req.position >= acc) {
          return acc + 1
        }
        return acc
      }, 1)

      return result + 1
    },

  getOrderById: (state) => (orderId) => {
    return state.orders.find((order) => order.id === orderId)
  },
  get_tasksLastPosition:
    (state) =>
    ({ type, orderId }) => {
      const indexOfOrder = state.orders.map((o) => o.id).indexOf(orderId)
      const tasks = state.orders[indexOfOrder][type]

      if (!tasks.length) {
        return 1
      }

      const result = tasks.reduce((acc, req) => {
        if (req.position >= acc) {
          return acc + 1
        }
        return acc
      }, 1)

      return result + 1
    },

  notificationsByOrdersId: (state, getters, rootState) => {
    const notificationsByOrdersId = {}
    const { tools, instructions, appointments, allowablesPools, ...rawTypes } =
      JOB_TYPES

    const types = Object.values(rawTypes)

    // const orders = state.orders
    const routes = rootState.oos.routes.routes
    // const userId = rootState.auth.user.profile.uid

    if (!routes?.length) {
      return notificationsByOrdersId
    }

    for (let r = 0; r < routes.length; r++) {
      const route = routes[r]

      if (!route.ordersR || !Object.keys(route.ordersR).length) {
        continue
      }

      const ordersId = Object.keys(route.ordersR)

      for (let o = 0; o < ordersId.length; o++) {
        const orderId = ordersId[o]

        notificationsByOrdersId[orderId] = []

        for (let i = 0; i < types.length; i++) {
          const type = types[i]
          if (
            !route.ordersR[orderId]?.[type] ||
            !Object.keys(route.ordersR[orderId][type]).length
          ) {
            continue
          }

          const taskIds = Object.keys(route.ordersR[orderId][type])

          for (let j = 0; j < taskIds.length; j++) {
            const taskId = taskIds[j]
            const task = route.ordersR[orderId][type][taskId]

            if (type === JOB_TYPES.inspections) {
              const contractorCompletedByArea = task.contractorCompletedByArea
              if (!contractorCompletedByArea) continue
              const areasCompleted = Object.keys(contractorCompletedByArea)
              if (!areasCompleted.length) continue

              const reportsApprovedByArea = task.reportsApprovedByArea

              for (let s = 0; s < areasCompleted.length; s++) {
                const area = areasCompleted[s]

                if (!contractorCompletedByArea?.[area]) continue
                if (reportsApprovedByArea?.[area]) continue

                notificationsByOrdersId[orderId].push({
                  id: crypto.randomUUID(),
                  routeId: route.id,
                  taskId,
                  area,
                  itemTitle: `${area} in ${task.title}`,
                  update: `Contractor Completed`,
                  type,
                })
              }
            }

            const indexOfRequirement = state.requirementsListMap.findIndex(
              (rl) => {
                return (
                  rl.orderId === orderId &&
                  rl.taskId === taskId &&
                  rl.taskType === type
                )
              }
            )

            if (indexOfRequirement === -1) {
              continue
            }
            const requirements =
              state.requirementsListMap[indexOfRequirement].requirements

            if (requirements?.length) {
              for (let k = 0; k < requirements.length; k++) {
                const requirement = requirements[k]

                if (!requirement.contractorCompleted) {
                  continue
                }

                if (requirement.oosChecked) {
                  continue
                }

                notificationsByOrdersId[orderId].push({
                  id: crypto.randomUUID(),
                  routeId: route.id,
                  taskId,
                  reqId: requirement.id,
                  itemTitle: requirement.descRequirement,
                  update: `Contractor Completed`,
                  type,
                })
              }
            }
          }
        }
      }
    }

    // Notification for Messages

    return notificationsByOrdersId
  },
  notificationsByRoutesId: (state, getters) => {
    const notificationsByRoutesId = {}
    const notificationsByOrdersId = getters.notificationsByOrdersId

    const ordersId = Object.keys(notificationsByOrdersId)
    if (ordersId.length === 0) {
      return notificationsByRoutesId
    }

    for (let i = 0; i < ordersId.length; i++) {
      const orderId = ordersId[i]
      const notifications = notificationsByOrdersId[orderId]
      if (!notifications.length) {
        continue
      }
      for (let j = 0; j < notifications.length; j++) {
        const notification = notifications[j]
        if (!notification.routeId) {
          continue
        }
        if (!notificationsByRoutesId[notification.routeId]) {
          notificationsByRoutesId[notification.routeId] = []
        }
        notificationsByRoutesId[notification.routeId].push(notification)
      }
    }

    return notificationsByRoutesId
  },
}
