import { httpsCallable } from 'firebase/functions'
import { functions } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function copyPictures(
  { dispatch },
  { picsToCopyRequiremet, requirementId, type, templateId, requirement }
) {
  const files = picsToCopyRequiremet.map((picToCopy) => {
    const { oldTemplateId, oldRequirementId, ...pic } = picToCopy
    const bucket = picToCopy.url.split('/b/')[1].split('/o/')[0]

    return {
      path: `admin/config/${type}-templates/${oldTemplateId}/requirements/${oldRequirementId}/${pic.codeName}`,
      destinationPath: `admin/config/${type}-templates/${templateId}/requirements/${requirementId}/${pic.codeName}`,
      bucketName: bucket,
      destinationBucketName: TYPES_BUCKET.daytona_system_main,
    }
  })

  const copyFiles = httpsCallable(functions, 'copyFiles')

  await copyFiles({ files })

  for (let idx = 0; idx < requirement.pictures.length; idx++) {
    const pic = requirement.pictures[idx]
    const indexToCopy = picsToCopyRequiremet.findIndex(
      (ptc) => ptc.codeName === pic.codeName
    )

    if (indexToCopy >= 0) {
      const destinationPath = `admin/config/${type}-templates/${templateId}/requirements/${requirementId}/${picsToCopyRequiremet[indexToCopy].codeName}`
      const url = await dispatch(
        'admin/worksToDoTemplates/getUrl',
        { path: destinationPath },
        { root: true }
      )

      pic.url = url
    }
  }
}
