import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_materialsOrToolsByjobTasks(
  _,
  { orderId, type, taskId }
) {
  const q = query(
    collection(db, `orders/${orderId}/${type}/${taskId}/materialsOrTools`)
  )
  const materials = []

  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const material = {
      ...doc.data(),
      id: doc.id,
    }
    materials.push(material)
  })
  return materials
}
