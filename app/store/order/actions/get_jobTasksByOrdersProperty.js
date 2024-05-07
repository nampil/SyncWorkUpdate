import { collection, doc, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_jobTasksByOrdersProperty(
  { state, dispatch },
  { orderId }
) {
  const types = ['inspections', 'allowables', 'workToDos']
  const orderRef = doc(db, 'orders', orderId)
  const tasks = []
  const promises = []
  for (const type of types) {
    const dummyTask = state.dummyTasks[type]
    const q = query(collection(orderRef, type))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach((doc) => {
      const task = {
        ...dummyTask,
        ...doc.data(),
        id: doc.id,
        type,
        reports: [],
      }

      tasks.push(task)
    })
  }
  for (const task of tasks) {
    const requirementsOnTask = dispatch('get_requirementsByjobTasks', {
      orderId,
      taskId: task.id,
      type: task.type,
    }).then((requirements) => {
      task.requirements = requirements
    })

    const materialsOrToolsOnTask = dispatch('get_materialsOrToolsByjobTasks', {
      orderId,
      taskId: task.id,
      type: task.type,
    }).then((materialsOrTools) => {
      task.materialsOrTools = materialsOrTools
    })

    promises.push(requirementsOnTask)
    promises.push(materialsOrToolsOnTask)
  }

  await Promise.all(promises)

  return tasks
}
