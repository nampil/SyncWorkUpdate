import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_requirements_by_task(
  { commit, rootState },
  { taskId, taskType, orderId }
) {
  // eslint-disable-next-line
  console.log(
    'get_requirements_by_task: taskId, taskType, orderId',
    taskId,
    taskType,
    orderId
  )

  if (!taskId || !taskType || !orderId) {
    return
  }

  if (
    rootState.oos.orders.requirementsUnsuscribeMap[
      `${orderId}-${taskId}-${taskType}`
    ]
  ) {
    return
  }

  const q = query(
    collection(db, `orders/${orderId}/${taskType}/${taskId}/requirements`)
  )

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const requirement = {
      ...doc.data(),
      id: doc.id,
    }
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
  })
}
