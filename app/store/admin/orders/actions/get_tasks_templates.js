import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'
export async function get_tasks_templates({ commit }, type) {
  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    commit('admin/itemForInvoiceTemplates/set_itemForInvoiceTemplates', [], {
      root: true,
    })
  }
  if (type === TEMPLATES_TYPES.workToDos) {
    commit('admin/worksToDoTemplates/set_workToDoTemplates', [], {
      root: true,
    })
  }
  if (type === 'winterization') {
    commit('admin/winterizationTemplates/set_winterizationTemplates', [], {
      root: true,
    })
  }

  const templates = []

  const q = query(collection(db, `admin/config/${type}-templates`))

  const querySnapshot = await getDocs(q)

  for (let i = 0; i < querySnapshot.docs.length; i++) {
    const doc = querySnapshot.docs[i]

    const template = {
      ...doc.data(),
      id: doc.id,

      ...((type === TEMPLATES_TYPES.workToDos || type === 'winterization') && {
        requirements: [],
      }),
    }
    templates.push(template)

    if (type === TEMPLATES_TYPES.itemsForInvoices) {
      commit(
        'admin/itemForInvoiceTemplates/add_itemForInvoiceTemplate',
        template,
        {
          root: true,
        }
      )
    }
    if (type === TEMPLATES_TYPES.workToDos) {
      commit('admin/worksToDoTemplates/add_workToDoTemplate', template, {
        root: true,
      })
    }
    if (type === 'winterization') {
      commit(
        'admin/winterizationTemplates/add_winterizationTemplate',
        template,
        {
          root: true,
        }
      )
    }
  }
  return templates
}
