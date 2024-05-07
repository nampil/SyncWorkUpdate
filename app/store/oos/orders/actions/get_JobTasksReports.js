import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_JobTasksReports(
  { commit, state, rootState },
  { orderId, type, taskId }
) {
  return new Promise((resolve, reject) => {
    try {
      let firstLoaded = false
      const reportsRef = collection(
        db,
        `orders/${orderId}/${type}/${taskId}/reports`
      )
      const q = query(reportsRef)
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            firstLoaded = true
          }
          snapshot.docChanges().forEach((change) => {
            const docData = { ...change.doc.data() }
            const doc = {
              ...change.doc.data(),
              id: change.doc.id,
              ...(Object.hasOwnProperty.call(docData, 'createdAt') &&
                docData.createdAt === null && {
                  createdAt: Timestamp.fromDate(new Date()),
                }),
            }

            if (change.type === 'added') {
              const routes = rootState.oos.routes.routes
              const route = routes.find((route) =>
                route.orders.includes(orderId)
              )
              const routeId = route ? route.id : ''
              const taskSelected = state.taskSelected
              const order = state.orders.find((order) => order.id === orderId)
              const task = order
                ? order[type].find((task) => task.id === taskId)
                : null
              const taskTitle = task ? task.title : ''

              commit('add_task_report', {
                doc,
                type,
                orderId,
                taskId,
                routeId,
                taskSelected,
                taskTitle,
              })
            }
            if (change.type === 'modified') {
              commit('update_task_report', { doc, type, orderId, taskId })
            }
            if (change.type === 'removed') {
              commit('remove_task_report', {
                docId: doc.id,
                type,
                orderId,
                taskId,
              })
            }
          })
          if (!firstLoaded) {
            firstLoaded = true
          }
        },
        (error) => {
          // eslint-disable-next-line
          console.log('Reports', error)
          reject(error)
        }
      )
      // console.log('unsuscriber', unsubscribe)
      commit('add_jobTaskReportsListeners', { unsubscribe, taskId })
      let count = 0
      const waitter = setInterval(() => {
        if (count >= 150) {
          clearInterval(waitter)
          reject(new Error('Timeout'))
        }
        if (firstLoaded) {
          clearImmediate(waitter)
          resolve()
        }
        count++
      }, 200)
    } catch (error) {
      reject(error)
    }
  })
}
