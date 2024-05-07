import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_jobTasksRequirements(
  { commit, rootState, state, getters },
  { orderId, type, taskId }
) {
  const requirementsRef = collection(
    db,
    `orders/${orderId}/${type}/${taskId}/requirements`
  )

  const q = query(requirementsRef)
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const docData = { ...change.doc.data() }
        const doc = {
          ...change.doc.data(),
          id: change.doc.id,
          ...(!docData.position && {
            position: getters.get_requirementsLastPosition({
              orderId,
              taskId,
              type,
            }),
          }),

          ...(Object.hasOwnProperty.call(docData, 'startedAt') &&
            !docData.startedAt && {
              startedAt: Timestamp.fromDate(new Date()),
            }),
          ...(Object.hasOwnProperty.call(docData, 'finishedAt') &&
            !docData.finishedAt && {
              finishedAt: Timestamp.fromDate(new Date()),
            }),
        }

        if (change.type === 'added') {
          commit('add_task_requirements', { doc, type, orderId, taskId })
        }
        if (change.type === 'modified') {
          const routes = rootState.oos.routes.routes
          const route = routes.find((route) => route.orders.includes(orderId))
          const routeId = route ? route.id : ''
          const taskSelected = state.taskSelected

          commit('update_task_requirements', {
            doc,
            type,
            orderId,
            taskId,
            routeId,
            taskSelected,
          })
        }
        if (change.type === 'removed') {
          commit('remove_task_requirements', {
            docId: doc.id,
            type,
            orderId,
            taskId,
          })
        }
      })
    },
    (error) => {
      // eslint-disable-next-line
      console.log('Requirements', error)
    }
  )
  commit('add_jobTaskRequirementsListeners', { unsubscribe, taskId, orderId })
}
