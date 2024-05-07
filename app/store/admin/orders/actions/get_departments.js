import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
export async function get_departments(_) {
  const clients = []
  const q = query(collection(db, `admin/config/departments-list`))
  const querySnapshot = await getDocs(q)

  for (let i = 0; i < querySnapshot.docs.length; i++) {
    const doc = querySnapshot.docs[i]
    const client = {
      ...doc.data(),
      id: doc.id,
    }
    clients.push(client)
  }
  return clients
}
