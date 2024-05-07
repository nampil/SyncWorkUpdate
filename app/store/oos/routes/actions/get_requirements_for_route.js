import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { JOB_TYPES } from '~/utils/dictionaries'

export function get_requirements_for_route(
  { commit, state, rootState },
  { route }
) {
  if (!route || !route.ordersR) return

  const ordersR = route.ordersR

  const orderIds = Object.keys(ordersR)

  if (!orderIds.length) return

  const tasksTypes = [
    JOB_TYPES.workToDos,
    JOB_TYPES.inspections,
    JOB_TYPES.allowables,
  ]

  orderIds.forEach((orderId) => {
    tasksTypes.forEach((taskType) => {
      if (ordersR[orderId]?.[taskType]) {
        const taskIds = Object.keys(ordersR[orderId][taskType])
        taskIds.forEach((taskId) => {
          if (
            rootState.oos.orders.requirementsUnsuscribeMap[
              `${orderId}-${taskId}-${taskType}`
            ]
          ) {
            return
          }

          const requirementsRef = collection(
            db,
            `orders/${orderId}/${taskType}/${taskId}/requirements`
          )

          const unsubscribe = onSnapshot(requirementsRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const requirement = {
                ...change.doc.data(),
                id: change.doc.id,
              }

              if (change.type === 'added') {
                commit(
                  'oos/orders/add_requirement',
                  {
                    requirement,
                    orderId,
                    taskId,
                    taskType,
                  },
                  { root: true }
                )
              }
              if (change.type === 'modified') {
                commit(
                  'oos/orders/update_requirement',
                  {
                    requirement,
                    orderId,
                    taskId,
                    taskType,
                  },
                  { root: true }
                )
              }
              if (change.type === 'removed') {
                commit(
                  'oos/orders/delete_requirement',
                  {
                    requirement,
                    orderId,
                    taskId,
                    taskType,
                  },
                  { root: true }
                )
              }
            })
          })

          commit(
            'oos/orders/set_requirement_unsubscribe',
            {
              unsubscribe,
              orderId,
              taskId,
              taskType: JOB_TYPES.workToDos,
            },
            { root: true }
          )
        })
      }
    })
  })
}
