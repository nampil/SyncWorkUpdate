import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_taskOrdersTemplates(_, { orderId }) {
  const jobsTypes = ['workToDos', 'inspections', 'allowablesPools']
  const tasks = {}

  for (let i = 0; i < jobsTypes.length; i++) {
    const _type = jobsTypes[i]
    const q = query(
      collection(db, `admin/config/orders-templates/${orderId}/${_type}`)
    )
    tasks[_type] = []

    /* tasks */
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const task = {
        ...doc.data(),
        id: doc.id,
      }

      tasks[_type].push(task)
    })
    /* Requirements */
    tasks[_type].forEach(async (typeTask) => {
      const qRequirements = query(
        collection(
          db,
          `admin/config/orders-templates/${orderId}/${_type}/${typeTask.id}/requirements`
        )
      )
      const querySnapshotRequi = await getDocs(qRequirements)
      typeTask.requirements = []
      querySnapshotRequi.forEach((doc) => {
        const req = {
          ...doc.data(),
          id: doc.id,
        }

        typeTask.requirements.push(req)
      })

      const qMaterials = query(
        collection(
          db,
          `admin/config/orders-templates/${orderId}/${_type}/${typeTask.id}/materialsOrTools`
        )
      )
      const querySnapshotMaterials = await getDocs(qMaterials)
      typeTask.materialsOrTools = []
      querySnapshotMaterials.forEach((doc) => {
        const material = {
          ...doc.data(),
          id: doc.id,
        }
        typeTask.materialsOrTools.push(material)
      })
    })
  }
  return tasks
}
