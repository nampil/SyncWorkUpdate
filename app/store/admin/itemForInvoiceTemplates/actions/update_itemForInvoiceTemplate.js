import { isEqual } from 'lodash'

import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export async function update_itemForInvoiceTemplate(
  { state, dispatch, getters },
  { newItem }
) {
  // eslint-disable-next-line
  console.log('getters', getters.newMaterialsOrTools)

  const promises = []
  const workTemplate = state.workTemplate
  if (!workTemplate) throw new Error('workTemplate is not defined')

  const isNewWorkTemplate = workTemplate.id.includes('local')

  let workTemplateId = isNewWorkTemplate ? null : workTemplate.id

  if (isNewWorkTemplate) {
    //  create work template

    const { requirements, id, materialsOrTools, ...objectToSend } = workTemplate
    const _requirements = requirements.map((req) => {
      return {
        ...req,
        pictures: req.pictures && req.pictures.length ? [...req.pictures] : [],
        ...(req.files?.length && { files: [...req.files] }),
      }
    })
    const _materialsOrTools = materialsOrTools.map((m) => {
      return { ...m }
    })
    try {
      workTemplateId = await dispatch(
        'admin/orders/add_task_templates',
        {
          objectToSend,
          requirements: _requirements,
          type: TEMPLATES_TYPES.workToDos,
          materialsOrTools: _materialsOrTools,
          // picsToCopy,
        },
        { root: true }
      )
    } catch (error) {
      // eslint-disable-next-line
      console.log('error', error)
    }
  } else if (
    state.originalWorkTemplate &&
    !isEqual(state.originalWorkTemplate, workTemplate)
  ) {
    //  update work template

    const { requirements, ...objectToSend } = workTemplate
    const type = TEMPLATES_TYPES.workToDos
    const requirementsDelete = []

    const baseRequirements = state.originalWorkTemplate.requirements || []
    const basePictures = state.originalWorkTemplate.pictures || []

    if (baseRequirements?.length) {
      baseRequirements.forEach((baseRequirement) => {
        if (
          baseRequirement.templateId === workTemplateId &&
          !requirements.find(
            (requirement) => requirement.id === baseRequirement.id
          )
        ) {
          requirementsDelete.push(baseRequirement)
        }
      })
    }

    const newMaterialsOrTools = getters.newMaterialsOrTools
    const materialsOrToolsDelete = getters.materialsOrToolsDelete

    const updatedWorkTemplate = dispatch(
      'admin/orders/update_task_template',
      {
        objectToSend,
        type,
        requirements,
        baseRequirements,
        requirementsDelete,
        basePictures,
        newMaterialsOrTools,
        materialsOrToolsDelete,
      },
      { root: true }
    )
    promises.push(updatedWorkTemplate)
  }

  for (let index = 0; index < newItem.prices.length; index++) {
    const type = TEMPLATES_TYPES.itemsForInvoices
    const _newItem = {
      id: newItem.prices[index].id,
      active: newItem.active,
      client: newItem.prices[index].client,
      desc: newItem.desc,
      loanTypes: newItem.prices[index].loanTypes,
      price: newItem.prices[index].price,
      title: newItem.title.trim().replace('/', '-'),
      unit: newItem.unit.title ? newItem.unit.title : newItem.unit,
      workTemplateId,
    }
    if (_newItem.id) {
      const promise = dispatch(
        `admin/orders/update_task_template`,
        {
          objectToSend: _newItem,
          type,
        },
        { root: true }
      )
      promises.push(promise)
    } else {
      const promise = dispatch(
        `admin/orders/add_task_templates`,
        {
          objectToSend: _newItem,
          type,
        },
        { root: true }
      )
      promises.push(promise)
    }
  }

  await Promise.all(promises)
}
