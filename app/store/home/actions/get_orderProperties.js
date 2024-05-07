import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_orderProperties({ commit }) {
  const q = query(collection(db, 'admin/config/orderProperties'))
  const properties = []
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const property = {
      ...doc.data(),
      uid: doc.id,
    }
    properties.push(property.headerOptions)
  })

  commit('add_orderProperties', properties)
}
