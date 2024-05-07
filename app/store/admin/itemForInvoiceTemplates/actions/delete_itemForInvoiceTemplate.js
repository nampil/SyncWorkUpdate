import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export function delete_itemForInvoiceTemplate({ dispatch }, { objectDelete }) {
  const promises = []
  // if (objectDelete.workTemplateId) {
  //   const workTemplateRef = doc(
  //     db,
  //     `admin/config/${TEMPLATES_TYPES.workToDos}-templates/${objectDelete.workTemplateId}`
  //   )
  //   const workTemplate = await getDoc(workTemplateRef).then((doc) => ({
  //     ...doc.data(),
  //     id: doc.id,
  //   }))

  //   const deleteWorkTemplate = dispatch(
  //     'admin/orders/delete_task_template',
  //     {
  //       objectDelete: workTemplate,
  //       type: TEMPLATES_TYPES.workToDos,
  //     },
  //     { root: true }
  //   )

  //   promises.push(deleteWorkTemplate)
  // }

  const deleted = dispatch(
    'admin/orders/delete_task_template',
    {
      objectDelete,
      type: TEMPLATES_TYPES.itemsForInvoices,
    },
    { root: true }
  )

  promises.push(deleted)

  return Promise.all(promises)
}
