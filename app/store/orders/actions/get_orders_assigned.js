import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_orders_assigned() {
  const q = query(collection(db, 'orders'), where('assigned', '==', true))
  const querySnapshot = await getDocs(q)
  const contractorsList = []
  querySnapshot.forEach((doc) => {
    contractorsList.push({
      ...doc.data(),
      id: doc.id,
    })
  })
  return contractorsList
}
