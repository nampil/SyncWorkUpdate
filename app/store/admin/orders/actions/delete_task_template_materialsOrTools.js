import { doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
export async function delete_task_template_materialsOrTools(
  { _ },
  { templateId, type, materials }
) {
  if (!materials?.length) return

  const batch = writeBatch(db)

  for (let idx = 0; idx < materials.length; idx++) {
    const material = materials[idx]

    const templatesRefMaterialsOrTools = doc(
      db,
      `admin/config/${type}-templates/${templateId}/materialsOrTools`,
      material.id
    )
    batch.delete(templatesRefMaterialsOrTools)
  }

  await batch.commit()
}
