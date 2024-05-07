import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

function getCreateTime(doc) {
  if (doc.data().createdAt) {
    return doc.data().createdAt
  }
  if (
    doc._document &&
    doc._document.createTime &&
    doc._document.createTime.timestamp
  ) {
    return doc._document.createTime.timestamp
  }

  return Timestamp.fromDate(new Date('2023-01-01'))
}

export async function get_JobTasks(
  { commit, dispatch, state, getters },
  { orderId }
) {
  const types = [
    'inspections',
    'allowables',
    'workToDos',
    'allowablesPools',
    // 'tools',
    'appointments',
    'instructions',
  ]
  const user = await dispatch('get_userNoteTo', {
    userUids: ['GWnI2NMu9rSI4qcslqyIYNacoME3'],
  })
  const orderRef = doc(db, 'orders', orderId)
  const jobTaskListeners = []

  types.forEach((type) => {
    const collRef = collection(orderRef, type)
    const q = query(collRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const doc = {
          ...change.doc.data(),
          id: change.doc.id,
          ...(!change.doc.data().position && {
            position: getters.get_tasksLastPosition({
              type,
            }),
          }),
        }

        if (change.type === 'added') {
          const dummyTask = state.dummyTasks[type]

          commit('add_job_task', {
            doc: {
              ...dummyTask,
              ...doc,
              requirements: [],
              reports: [],
              materialsOrTools: [],
              pictures: doc.pictures || [],
              quantityPhotosRequiredForBefore:
                doc.quantityPhotosRequiredForBefore || '',
              quantityPhotosRequiredForDuring:
                doc.quantityPhotosRequiredForDuring || '',
              quantityPhotosRequiredForAfter:
                doc.quantityPhotosRequiredForAfter || '',
              quantityPhotosRequiredForGeneral:
                doc.quantityPhotosRequiredForGeneral || '',
              createdAt: getCreateTime(change.doc),
              createdBy: doc.createdBy ? doc.createdBy : user[0],
            },
            type,
            orderId,
          })
          dispatch('get_jobTasksRequirements', {
            orderId,
            type,
            taskId: doc.id,
          })
          dispatch('get_jobTasksMaterialsOrTools', {
            orderId,
            type,
            taskId: doc.id,
          })
        }
        if (change.type === 'modified') {
          commit('update_job_task', { doc, type, orderId })
        }
        if (change.type === 'removed') {
          commit('remove_job_task', { docId: doc.id, type, orderId })
        }
      })
    })
    jobTaskListeners.push(unsubscribe)
  })

  commit(`add_jobTaskListeners_listeners`, jobTaskListeners)
}
