import {
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { JOB_TYPES, TEMPLATES_TYPES } from '@/utils/dictionaries'

export function get_JobTasks(
  { commit, dispatch, rootState, state, getters },
  { orderId }
) {
  const { tools, instructions, ...rawTypes } = JOB_TYPES

  const types = Object.values(rawTypes)

  const orderRef = doc(db, 'orders', orderId)
  const routes = rootState.oos.routes.routes
  const route = routes.find((route) => route.orders.includes(orderId))
  const routeId = route ? route.id : ''

  const jobTaskListeners = []
  // const selectedOrderId = rootState.oos.routes.selectOrder
  types.forEach((type) => {
    const collRef = collection(orderRef, type)
    const q = query(collRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const docData = { ...change.doc.data() }

          const doc = {
            ...change.doc.data(),
            id: change.doc.id,
            ...(!change.doc.data().position && {
              position: getters.get_tasksLastPosition({
                type,
                orderId,
              }),
            }),

            ...(Object.hasOwnProperty.call(docData, 'startedAt') &&
              docData.startedAt === null && {
                startedAt: Timestamp.fromDate(new Date()),
              }),

            ...(Object.hasOwnProperty.call(docData, 'finishedAt') &&
              docData.finishedAt === null && {
                finishedAt: Timestamp.fromDate(new Date()),
              }),

            ...(type === TEMPLATES_TYPES.inspections &&
              !change.doc.data().reportsApprovedByArea && {
                reportsApprovedByArea: {},
              }),

            ...(Object.hasOwnProperty.call(docData, 'beforeFinishedAt') &&
              docData.beforeFinishedAt === null && {
                beforeFinishedAt: Timestamp.fromDate(new Date()),
              }),
            ...(Object.hasOwnProperty.call(docData, 'duringFinishedAt') &&
              docData.duringFinishedAt === null && {
                duringFinishedAt: Timestamp.fromDate(new Date()),
              }),
            ...(Object.hasOwnProperty.call(docData, 'afterFinishedAt') &&
              docData.afterFinishedAt === null && {
                afterFinishedAt: Timestamp.fromDate(new Date()),
              }),
            // ...(Object.hasOwnProperty.call(docData, 'finishedAt') &&
            //   docData.finishedAt === null && {
            //     finishedAt: Timestamp.fromDate(new Date()),
            //   }),

            reportsSelected: [],
          }

          // console.log('selectedOrderId', selectedOrderId)

          if (change.type === 'added') {
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
            dispatch('get_taskChats', { orderId, type, task: doc, routeId })
            commit('add_job_task', {
              doc: {
                ...doc,
                reports: [],
                requirements: [],
                materialsOrTools: [],
                taskChats: [],
              },
              type,
              orderId,
            })
          }
          if (change.type === 'modified') {
            commit('update_job_task', {
              doc,
              type,
              orderId,
              routeId,
            })
            // commit('show_notification_order_by_id', {
            //   orderId,
            //   selectedOrderId,
            // })
          }
          if (change.type === 'removed') {
            commit('remove_job_task', { docId: doc.id, type, orderId })
          }
        })
        // console.log("DOC:", doc)
      },
      (error) => {
        // eslint-disable-next-line
        console.log('get_task', error)
      }
    )
    jobTaskListeners.push(unsubscribe)
  })

  commit(`add_jobTaskListeners`, {
    orderId,
    listeners: jobTaskListeners,
  })
}
