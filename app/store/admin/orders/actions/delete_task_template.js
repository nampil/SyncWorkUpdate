import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'

export async function delete_task_template(
  { dispatch, commit },
  { objectDelete, type }
) {
  const templatesRef = doc(
    db,
    `admin/config/${type}-templates`,
    objectDelete.id
  )
  const requirementRef = query(
    collection(
      db,
      `admin/config/${type}-templates/${objectDelete.id}/requirements`
    )
  )
  const materialsOrToolsRef = query(
    collection(
      db,
      `admin/config/${type}-templates/${objectDelete.id}/materialsOrTools`
    )
  )
  const querySnapshotRequirements = await getDocs(requirementRef)
  const querySnapshotMaterialsOrTools = await getDocs(materialsOrToolsRef)

  if (objectDelete.pictures && objectDelete.pictures.length) {
    await dispatch('remove_pic_for_task_template', {
      picsToDelete: objectDelete.pictures,
      type,
      templateId: objectDelete.id,
    })
  }
  querySnapshotRequirements.forEach((doc) => {
    deleteDoc(doc.ref)
  })
  querySnapshotMaterialsOrTools.forEach((doc) => {
    deleteDoc(doc.ref)
  })
  await deleteDoc(templatesRef)

  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    commit(
      'admin/itemForInvoiceTemplates/remove_itemForInvoiceTemplate',
      objectDelete,
      { root: true }
    )
  }
  if (type === TEMPLATES_TYPES.workToDos) {
    commit('admin/worksToDoTemplates/remove_workToDoTemplate', objectDelete, {
      root: true,
    })
  }

  if (type === 'winterization') {
    commit(
      'admin/winterizationTemplates/remove_winterizationTemplate',
      objectDelete,
      {
        root: true,
      }
    )
  }
}
