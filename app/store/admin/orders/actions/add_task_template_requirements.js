import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_task_template_requirements(
  { dispatch },
  { templateId, type, requirement }
) {
  const templatesRefRequirements = doc(
    collection(db, `admin/config/${type}-templates/${templateId}/requirements`)
  )

  const { picsToCopyRequiremet, ..._requirement } = requirement

  if (picsToCopyRequiremet?.length) {
    await dispatch('copyPictures', {
      picsToCopyRequiremet,
      requirementId: templatesRefRequirements.id,
      type,
      templateId,
      requirement,
    })
  }

  _requirement.templateId = templateId

  if (_requirement.files?.length > 0) {
    const files = _requirement.files
    const urls = await dispatch('upload_pic_for_requirements', {
      files,
      templateId,
      type,
      requirementId: templatesRefRequirements.id,
    })

    // requirement.pictures = urls

    urls.forEach((url) => {
      const idx = _requirement.pictures.findIndex(
        (p) => p.codeName === url.codeName
      )
      if (idx === -1) {
        _requirement.pictures.push(url)
      } else {
        _requirement.pictures.splice(idx, 1, url)
      }
    })
  }

  const { files, id, ...requirementToSend } = _requirement

  setDoc(templatesRefRequirements, requirementToSend)
}
