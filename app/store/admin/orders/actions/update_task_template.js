import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'

export async function update_task_template(
  { dispatch, commit },
  {
    objectToSend,
    type,
    requirements,
    baseRequirements,
    requirementsDelete,
    basePictures,
    newMaterialsOrTools,
    materialsOrToolsDelete,
  }
) {
  const templatesRef = doc(
    db,
    `admin/config/${type}-templates`,
    objectToSend.id
  )
  let _objectToSend = {}

  if (type === TEMPLATES_TYPES.inspectionsOptions) {
    _objectToSend = {
      text: objectToSend.text,
      active: objectToSend.active,
    }
  }
  if (type === TEMPLATES_TYPES.inspections) {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      active: objectToSend.active,
      client: objectToSend.client,
      loanTypes: objectToSend.loanTypes,
      subAreas: objectToSend.subAreas,
    }
  }
  if (type === TEMPLATES_TYPES.workToDos) {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      needProcessTimes: objectToSend.needProcessTimes,
      files: objectToSend.files,
      pictures: objectToSend.pictures ? [...objectToSend.pictures] : [],
      active: objectToSend.active,
      client: objectToSend.client || '',
      loanTypes: objectToSend.loanTypes || [],
      itemsForInvoices: objectToSend.itemsForInvoices || [],
      ect: objectToSend.ect,
      instructions: objectToSend.instructions,
    }
  }
  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      price: objectToSend.price,
      active: objectToSend.active,
      unit: objectToSend.unit,
      client: objectToSend.client,
      loanTypes: [...objectToSend.loanTypes],
      workTemplateId: objectToSend.workTemplateId,
    }
  }
  if (type === TEMPLATES_TYPES.units) {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      active: objectToSend.active,
    }
  }
  if (type === 'orderStatus') {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      active: objectToSend.active,
    }
  }
  if (type === TEMPLATES_TYPES.tools || type === TEMPLATES_TYPES.subAreas) {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
    }
  }
  if (type === 'customers') {
    _objectToSend = {
      title: objectToSend.title,
    }
  }
  if (type === 'winterization') {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      needProcessTimes: objectToSend.needProcessTimes,
      files: objectToSend.files,
      pictures: objectToSend.pictures ? objectToSend.pictures : [],
      active: objectToSend.active,
      client: objectToSend.client,
      loanTypes: objectToSend.loanTypes,
      itemsForInvoices: objectToSend.itemsForInvoices,
      winterizationType: objectToSend.winterizationType,
    }
  }
  if (type === 'bids') {
    _objectToSend = {
      title: objectToSend.title,
      desc: objectToSend.desc,
      qty: objectToSend.qty,
      contractorPrice: objectToSend.contractorPrice,
      clientPrice: objectToSend.clientPrice,
      client: objectToSend.client,
      loanTypes: objectToSend.loanTypes,
      alternativeTitles: objectToSend.alternativeTitles,
      observations: objectToSend.observations,
    }
  }

  /* Eliminar files storage */
  if (_objectToSend.pictures) {
    const picsToDelete = basePictures.filter((pic) => {
      const index = _objectToSend.pictures
        .map((pic) => pic.codeName)
        .indexOf(pic.codeName)
      return index === -1
    })

    if (picsToDelete.length) {
      await dispatch('remove_pic_for_task_template', {
        picsToDelete,
        type,
        templateId: templatesRef.id,
      })
    }
  }
  /* Files update */
  if (_objectToSend.files && _objectToSend.files.length > 0) {
    const urls = await dispatch('upload_pic_for_tasks_template', {
      files: _objectToSend.files,
      type,
      templateId: templatesRef.id,
    })

    urls.forEach((url) => {
      const idx = _objectToSend.pictures.findIndex((pic) => {
        return pic.codeName === url.codeName
      })

      if (idx >= 0) {
        const pic = _objectToSend.pictures[idx]
        const { url: _url } = url
        _objectToSend.pictures.splice(idx, 1, {
          ...pic,
          url: _url,
        })
      }
    })

    // _objectToSend.pictures = _objectToSend.pictures.filter((pic) => pic.name)
  }

  const { files, ...send } = _objectToSend

  await updateDoc(templatesRef, send)

  // eslint-disable-next-line
  console.log('objectToSendCopy', objectToSendCopy)

  const objectToSendCopy = structuredClone(objectToSend)

  if (type === TEMPLATES_TYPES.itemsForInvoices) {
    commit(
      'admin/itemForInvoiceTemplates/update_itemForInvoiceTemplate',
      {
        ...objectToSendCopy,
        id: templatesRef.id,
      },
      { root: true }
    )
  }

  if (type === TEMPLATES_TYPES.workToDos) {
    commit(
      'admin/worksToDoTemplates/update_workToDoTemplate',
      {
        ...objectToSendCopy,
        id: templatesRef.id,
      },
      { root: true }
    )
  }
  if (type === 'winterization') {
    commit(
      'admin/winterizationTemplates/update_winterizationTemplate',
      {
        ...objectToSendCopy,
        id: templatesRef.id,
      },
      { root: true }
    )
  }

  if (requirements && requirements.length > 0) {
    for (let i = 0; i < requirements.length; i++) {
      const requirement = requirements[i]
      const baseRequirement = baseRequirements.find(
        (req) => req.id === requirement.id
      )

      if (baseRequirement) {
        dispatch('update_task_template_requirements', {
          templateId: objectToSend.id,
          type,
          requirement,
          basePictureRequirements: baseRequirement?.pictures ?? [],
        })
      } else {
        dispatch('add_task_template_requirements', {
          templateId: objectToSend.id,
          type,
          requirement,
        })
      }
    }
  }

  if (
    requirements &&
    requirementsDelete &&
    requirementsDelete.length &&
    (type === TEMPLATES_TYPES.workToDos || type === 'winterization')
  ) {
    for (let i = 0; i < requirementsDelete.length; i++) {
      dispatch('delete_task_template_requirements', {
        templateId: objectToSend.id,
        type,
        requirement: requirementsDelete[i],
      })
    }
  }

  if (newMaterialsOrTools && newMaterialsOrTools.length > 0) {
    // eslint-disable-next-line
    console.log('newMaterialsOrTools', newMaterialsOrTools)

    dispatch('add_task_template_materialsOrTools', {
      templateId: objectToSend.id,
      type,
      materials: [...newMaterialsOrTools],
    })
  }
  if (
    materialsOrToolsDelete &&
    materialsOrToolsDelete.length &&
    (type === TEMPLATES_TYPES.workToDos || type === 'winterization')
  ) {
    dispatch('delete_task_template_materialsOrTools', {
      templateId: objectToSend.id,
      type,
      materials: [...materialsOrToolsDelete],
    })
  }
}
