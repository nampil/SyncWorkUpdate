import { collection, doc, setDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'

export async function add_task_templates(
  { dispatch, commit },
  { objectToSend, type, requirements, materialsOrTools, picsToCopy }
) {
  const templatesRef = doc(collection(db, `admin/config/${type}-templates`))

  if (picsToCopy?.length) {
    const files = picsToCopy.map((picToCopy) => {
      const { oldTemplateId, ...pic } = picToCopy

      return {
        path: `admin/config/${type}-templates/${oldTemplateId}/${pic.codeName}`,
        destinationPath: `admin/config/${type}-templates/${templatesRef.id}/${pic.codeName}`,
      }
    })

    const copyFiles = httpsCallable(functions, 'copyFiles')

    await copyFiles({ files })

    for (let idx = 0; idx < objectToSend.pictures.length; idx++) {
      const pic = objectToSend.pictures[idx]
      const indexToCopy = picsToCopy.findIndex(
        (ptc) => ptc.codeName === pic.codeName
      )

      if (indexToCopy >= 0) {
        const destinationPath = `admin/config/${type}-templates/${templatesRef.id}/${picsToCopy[indexToCopy].codeName}`
        const url = await dispatch(
          'admin/worksToDoTemplates/getUrl',
          { path: destinationPath },
          { root: true }
        )

        pic.url = url
      }
    }
  }

  if (objectToSend.files && objectToSend.files.length) {
    const urls = await dispatch('upload_pic_for_task_template', {
      files: objectToSend.files,
      type,
      templateId: templatesRef.id,
    })

    objectToSend.pictures = objectToSend.pictures.map((pic) => {
      const idxPicToUptate = urls.findIndex(
        (url) => url.codeName === pic.codeName
      )
      if (idxPicToUptate === -1) return pic

      return {
        ...pic,
        url: urls[idxPicToUptate].url,
      }
    })
  }

  const { files, ..._objectToSend } = objectToSend

  await setDoc(templatesRef, _objectToSend, { merge: true })
  const objectToSendDeepCopy = structuredClone(_objectToSend)
  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    commit(
      'admin/itemForInvoiceTemplates/add_itemForInvoiceTemplate',
      {
        ...objectToSendDeepCopy,
        id: templatesRef.id,
      },
      { root: true }
    )
  }

  if (type === TEMPLATES_TYPES.workToDos) {
    commit(
      'admin/worksToDoTemplates/add_workToDoTemplate',
      {
        ...objectToSendDeepCopy,
        id: templatesRef.id,
      },
      { root: true }
    )
  }

  if (type === 'winterization') {
    commit(
      'admin/winterizationTemplates/add_winterizationTemplate',
      {
        ...objectToSendDeepCopy,
        id: templatesRef.id,
      },
      { root: true }
    )
  }

  if (requirements && requirements.length) {
    for (let i = 0; i < requirements.length; i++) {
      dispatch('add_task_template_requirements', {
        templateId: templatesRef.id,
        type,
        requirement: requirements[i],
      })
    }
  }

  if (materialsOrTools && materialsOrTools.length) {
    dispatch('add_task_template_materialsOrTools', {
      templateId: templatesRef.id,
      type,
      materials: [...materialsOrTools],
    })
  }

  return templatesRef.id
}
