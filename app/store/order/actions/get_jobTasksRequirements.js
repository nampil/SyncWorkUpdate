import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_jobTasksRequirements(
  { commit, state, getters },
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
        const data = change.doc.data()

        const doc = {
          ...data,
          id: change.doc.id,
          ...(!data.position && {
            position: getters.get_requirementsLastPosition({ taskId, type }),
          }),
        }

        if (change.type === 'added') {
          commit('add_task_requirements', { doc, type, taskId })
        }
        if (change.type === 'modified') {
          commit('update_task_requirements', { doc, type, taskId })
        }
        if (change.type === 'removed') {
          commit('remove_task_requirements', { docId: doc.id, type, taskId })
        }
      })
    },
    (error) => {
      // eslint-disable-next-line
      console.log('Requirements', error)
    }
  )

  commit('add_jobTaskRequirementsListeners', unsubscribe)
}
