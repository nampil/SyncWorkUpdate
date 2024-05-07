import { collection, doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
export function add_task_template_materialsOrTools(
  _,
  { templateId, type, materials }
) {
  const batch = writeBatch(db)

  for (let idx = 0; idx < materials.length; idx++) {
    const material = materials[idx]

    const templatesRefMaterialsOrTools = doc(
      collection(
        db,
        `admin/config/${type}-templates/${templateId}/materialsOrTools`
      )
    )
    batch.set(templatesRefMaterialsOrTools, {
      ...material,
      id: templatesRefMaterialsOrTools.id,
    })
  }

  return batch.commit()
}
