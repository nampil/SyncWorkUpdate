import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function woNumberNotExists(_, woNumber) {
  const orderRef = collection(db, 'orders')
  const q = query(orderRef, where('woNumber', '==', woNumber))
  const snapshot = await getDocs(q)
  return snapshot.empty
}
