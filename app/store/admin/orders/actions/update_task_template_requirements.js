import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_task_template_requirements(
  { dispatch },
  { templateId, type, requirement, basePictureRequirements }
) {
  if (!requirement.id.includes('localReq')) {
    const { files, id, picsToCopyRequiremet, ...requirementEdit } = requirement
    const templatesRefRequirements = doc(
      db,
      `admin/config/${type}-templates/${templateId}/requirements`,
      id
    )

    if (picsToCopyRequiremet?.length) {
      await dispatch('copyPictures', {
        picsToCopyRequiremet,
        requirementId: templatesRefRequirements.id,
        type,
        templateId,
        requirement,
      })
    }

    if (basePictureRequirements?.length) {
      const picsToDelete = basePictureRequirements.filter((pic) => {
        if (!requirementEdit.pictures?.length) return true

        return !requirementEdit.pictures
          .map((p) => p.codeName)
          .includes(pic.codeName)
      })

      if (picsToDelete.length) {
        await dispatch('remove_pic_for_requirement', {
          picsToDelete,
          templateId,
          type,
          requirementId: templatesRefRequirements.id,
        })
      }
    }

    if (files?.length) {
      const urls = await dispatch('upload_pic_for_requirements', {
        files,
        templateId,
        type,
        requirementId: templatesRefRequirements.id,
      })

      urls.forEach((url) => {
        const idx = requirementEdit.pictures.findIndex(
          (p) => p.codeName === url.codeName
        )
        if (idx === -1) {
          requirementEdit.pictures.push(url)
        } else {
          requirementEdit.pictures.splice(idx, 1, url)
        }
      })
    }

    updateDoc(templatesRefRequirements, requirementEdit)
  } else {
    dispatch('add_task_template_requirements', {
      templateId,
      type,
      requirement,
    })
  }
}
