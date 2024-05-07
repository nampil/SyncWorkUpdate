import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_history({ commit }, orderId) {
  const historyRef = collection(db, `orders/${orderId}/history`)
  const q = query(historyRef, orderBy('updatedAt', 'desc'), limit(30))
  const querySnapshot = await getDocs(q)
  const items = []

  querySnapshot.forEach((doc) => {
    items.push({
      ...doc.data(),
      id: doc.id,
    })
  })

  commit('set_history', items)
}
