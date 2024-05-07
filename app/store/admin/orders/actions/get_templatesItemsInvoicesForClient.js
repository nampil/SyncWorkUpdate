import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'
export async function get_templatesItemsInvoicesForClient(
  { commit },
  { type, client, loanTypes }
) {
  const templates = []

  const templatesRef = collection(db, `admin/config/${type}-templates`)
  const queryConstraints = []

  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    queryConstraints.push(where('active', '==', true))
    // if (client) {
    //   queryConstraints.push(where('client', '==', client))
    // }

    if (loanTypes) {
      queryConstraints.push(where('loanTypes', 'array-contains-any', loanTypes))
    }
  }

  const q = query(templatesRef, ...queryConstraints)
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    const template = {
      ...doc.data(),
      id: doc.id,
    }

    templates.push(template)
  })
  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    commit(
      'admin/itemForInvoiceTemplates/set_itemForInvoiceTemplates',
      templates,
      {
        root: true,
      }
    )
  }

  return templates
}
