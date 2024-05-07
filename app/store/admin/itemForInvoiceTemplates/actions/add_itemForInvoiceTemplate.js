import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export async function add_itemForInvoiceTemplate(
  { state, dispatch },
  { newItem }
) {
  const promises = []
  const workTemplate = state.workTemplate
  if (!workTemplate) throw new Error('workTemplate is not defined')

  const { requirements, id, materialsOrTools, ...objectToSend } = workTemplate

  const _requirements = requirements.map((req) => {
    return {
      ...req,
      ...(req.pictures && { pictures: [...req.pictures] }),
      ...(req.files?.length && { files: [...req.files] }),
    }
  })
  const _materialsOrTools = materialsOrTools.map((m) => {
    return { ...m }
  })

  const workTemplateId = await dispatch(
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

  for (let index = 0; index < newItem.prices.length; index++) {
    const type = TEMPLATES_TYPES.itemsForInvoices
    const _newItem = {
      active: newItem.active,
      client: newItem.prices[index].client,
      desc: newItem.desc,
      loanTypes: newItem.prices[index].loanTypes,
      price: newItem.prices[index].price,
      title: newItem.title.trim().replace('/', '-'),
      unit: newItem.unit.title ? newItem.unit.title : newItem.unit,
      workTemplateId,
    }
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
  await Promise.all(promises)
}
