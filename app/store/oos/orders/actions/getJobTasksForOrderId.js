import { collection, doc, getDocs } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'

export async function getJobTasksForOrderId({ dispatch }, { orderId }) {
  const orderRef = doc(db, 'orders', orderId)
  const types = ['inspections', 'allowables', 'workToDos', 'appointments']
  const tasks = []
  let templates = []
  for (let i = 0; i < types.length; i++) {
    const collRef = collection(orderRef, types[i])
    const querySnapshot = await getDocs(collRef)
    querySnapshot.forEach((doc) => {
      const task = {
        ...doc.data(),
        id: doc.id,
      }

      tasks.push(task)
    })
    if (types[i] === TEMPLATES_TYPES.inspections) {
      templates = await dispatch(
        'admin/orders/get_tasks_templates',
        'inspectionsOptions',
        { root: true }
      )
    }
  }
  return { tasks, areas: templates }
}
