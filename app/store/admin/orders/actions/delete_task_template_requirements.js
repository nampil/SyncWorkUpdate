import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_task_template_requirements(
  { dispatch },
  { templateId, type, requirement }
) {
  const templatesRefRequirements = doc(
    db,
    `admin/config/${type}-templates/${templateId}/requirements`,
    requirement.id
  )

  if (requirement.pictures?.length) {
    await dispatch('remove_pic_for_requirement', {
      picsToDelete: requirement.pictures,
      templateId,
      type,
      requirementId: templatesRefRequirements.id,
    })
  }

  await deleteDoc(templatesRefRequirements)
}
