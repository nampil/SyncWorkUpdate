import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
export async function get_materialsOrToolsForTemplate(_, { type, templateId }) {
  const materialsOrTools = []
  const qMaterialsOrTools = query(
    collection(
      db,
      `admin/config/${type}-templates/${templateId}/materialsOrTools`
    )
  )

  const querySnapshotMaterialsOrTools = await getDocs(qMaterialsOrTools)

  querySnapshotMaterialsOrTools.forEach((doc) => {
    const material = {
      ...doc.data(),
      id: doc.id,
    }
    materialsOrTools.push(material)
  })

  return materialsOrTools
}
