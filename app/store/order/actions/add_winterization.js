import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export function add_winterization(_, { orderId, addWinterization }) {
  try {
    const orderRef = doc(db, `orders/${orderId}`)

    return updateDoc(orderRef, {
      addWinterization,
    })
  } catch (error) {
    // eslint-disable-next-line
    console.log('error updting add winterization', error)

    throw error
  }
}
