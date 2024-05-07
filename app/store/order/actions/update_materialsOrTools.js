import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_materialsOrTools(
  _,
  { materialsOrTools, taskId, jobType, orderId, deleteMaterialsOrTools }
) {
  const batch = writeBatch(db)

  if (!materialsOrTools.length) {
    const qMaterialsOrTools = query(
      collection(db, `orders/${orderId}/${jobType}/${taskId}/materialsOrTools`)
    )
    const querySnapshotMaterialsOrTools = await getDocs(qMaterialsOrTools)
    querySnapshotMaterialsOrTools.forEach((doc) => {
      deleteDoc(doc.ref)
    })
    return
  }

  for (let i = 0; i < materialsOrTools.length; i++) {
    const refMaterialsOrTools = doc(
      collection(db, `orders/${orderId}/${jobType}/${taskId}/materialsOrTools`)
    )
    if (materialsOrTools[i].id) {
      const refMaterialOrTool = doc(
        collection(
          db,
          `orders/${orderId}/${jobType}/${taskId}/materialsOrTools`
        ),
        materialsOrTools[i].id
      )
      const { id, ...elementEdit } = materialsOrTools[i]
      await updateDoc(refMaterialOrTool, elementEdit)
    } else {
      batch.set(refMaterialsOrTools, materialsOrTools[i])
    }
  }

  if (deleteMaterialsOrTools.length) {
    for (let i = 0; i < deleteMaterialsOrTools.length; i++) {
      const materialId = deleteMaterialsOrTools[i]
      const refMaterialOrTool = doc(
        collection(
          db,
          `orders/${orderId}/${jobType}/${taskId}/materialsOrTools`
        ),
        materialId
      )
      batch.delete(refMaterialOrTool)
    }
  }
  await batch.commit()
}
