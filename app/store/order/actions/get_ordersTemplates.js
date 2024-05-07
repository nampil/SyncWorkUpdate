import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_ordersTemplates({ dispatch, commit }, { order }) {
  const templates = []

  const templatesRef = collection(db, `admin/config/orders-templates`)
  const queryConstraints = []

  queryConstraints.push(where('active', '==', true))
  // if (order.client) {
  //   queryConstraints.push(where('client', '==', order.client))
  // }
  // if (order.loanType) {
  //   queryConstraints.push(
  //     where('loanTypes', 'array-contains', order.loanType)
  //   )
  // }
  if (order.customer) {
    queryConstraints.push(where('customers', 'array-contains', order.customer))
  }

  const q = query(templatesRef, ...queryConstraints)

  const querySnapshot = await getDocs(q)

  for (let i = 0; i < querySnapshot.docs.length; i++) {
    const doc = querySnapshot.docs[i]

    const tasks = await dispatch(
      'admin/orders/get_taskOrdersTemplates',
      { orderId: doc.id },
      { root: true }
    )

    const template = {
      ...doc.data(),
      id: doc.id,
      ...tasks,
    }
    templates.push(template)
  }
  commit('set_jobTasksTemplatesInState', {
    client: order.client,
    loanType: order.loanType,
    templates,
    type: 'orders',
  })

  return templates
}
