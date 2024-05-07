import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_jobTasksMaterialsOrTools(
  { commit },
  { orderId, type, taskId }
) {
  const materialsOrToolsRef = collection(
    db,
    `orders/${orderId}/${type}/${taskId}/materialsOrTools`
  )

  const q = query(materialsOrToolsRef)
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const doc = { ...change.doc.data(), id: change.doc.id }

        if (change.type === 'added') {
          commit('add_task_materialsOrTools', { doc, type, taskId })
        }
        if (change.type === 'modified') {
          commit('update_task_materialsOrTools', { doc, type, taskId })
        }
        if (change.type === 'removed') {
          commit('remove_task_materialsOrTools', {
            docId: doc.id,
            type,
            taskId,
          })
        }
      })
    },
    (error) => {
      // eslint-disable-next-line
      console.log('Materials Or Tools', error)
    }
  )

  commit('add_jobTaskMaterialsOrToolsListeners', unsubscribe)
}
