import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export async function get_templatesForOrder({ commit }, { type, order }) {
  const _type =
    type === TEMPLATES_TYPES.allowables ? TEMPLATES_TYPES.workToDos : type
  const templates = []
  const requirementsPromises = []
  const materialsOrToolsPromises = []
  const templatesRef = collection(db, `admin/config/${type}-templates`)
  const queryConstraints = []

  if (
    type === TEMPLATES_TYPES.workToDos ||
    type === TEMPLATES_TYPES.itemsForInvoices
  ) {
    queryConstraints.push(where('active', '==', true))
    // if (order.client && type === TEMPLATES_TYPES.workToDos) {
    //   queryConstraints.push(where('client', '==', order.client))
    // }

    if (
      order.loanType &&
      order.client !== 'NFR' &&
      type !== TEMPLATES_TYPES.itemsForInvoices
    ) {
      queryConstraints.push(
        where('loanTypes', 'array-contains', order.loanType)
      )
    }
    if (
      order.loanType &&
      order.client !== 'NFR' &&
      type === TEMPLATES_TYPES.itemsForInvoices
    ) {
      queryConstraints.push(
        where('loanTypes', 'array-contains', order.loanType)
      )
    }
  }
  if (type === TEMPLATES_TYPES.units) {
    queryConstraints.push(where('active', '==', true))
  }
  if (type === TEMPLATES_TYPES.tools || type === TEMPLATES_TYPES.subAreas) {
    queryConstraints.push(where('title', '!=', ''))
  }
  if (type === TEMPLATES_TYPES.inspectionsOptions) {
    queryConstraints.push(where('text', '!=', ''))
  }
  if (type === TEMPLATES_TYPES.inspections) {
    queryConstraints.push(where('active', '==', true))
  }

  const q = query(templatesRef, ...queryConstraints)
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    let template = {}
    if (
      type !== TEMPLATES_TYPES.itemsForInvoices &&
      type !== TEMPLATES_TYPES.units &&
      type !== TEMPLATES_TYPES.tools
    ) {
      template = {
        ...doc.data(),
        id: doc.id,
        requirements: [],
        materialsOrTools: [],
      }
    }
    if (
      type === TEMPLATES_TYPES.itemsForInvoices ||
      type === TEMPLATES_TYPES.units ||
      type === TEMPLATES_TYPES.tools ||
      type === TEMPLATES_TYPES.inspectionsOptions ||
      type === TEMPLATES_TYPES.subAreas
    ) {
      template = {
        ...doc.data(),
        id: doc.id,
      }
    }
    templates.push(template)
  })
  // Get de los Requirements
  templates.forEach((template) => {
    const qRequirements = query(
      collection(
        db,
        `admin/config/${_type}-templates/${template.id}/requirements`
      )
    )
    requirementsPromises.push(getDocs(qRequirements))
  })
  const results = await Promise.all(requirementsPromises)

  results.forEach((querySnapshotRequirements, i) => {
    querySnapshotRequirements.forEach((doc) => {
      const requirement = {
        ...doc.data(),
        id: doc.id,
      }
      templates[i].requirements.push(requirement)
    })
  })

  // Get de los Materials Or Tools
  templates.forEach((template) => {
    const qMaterialsOrTools = query(
      collection(
        db,
        `admin/config/${_type}-templates/${template.id}/materialsOrTools`
      )
    )
    materialsOrToolsPromises.push(getDocs(qMaterialsOrTools))
  })
  const resultsMaterialsOrTools = await Promise.all(materialsOrToolsPromises)

  resultsMaterialsOrTools.forEach((querySnapshotMaterialsOrTools, i) => {
    querySnapshotMaterialsOrTools.forEach((doc) => {
      const material = {
        ...doc.data(),
        id: doc.id,
      }
      templates[i].materialsOrTools.push(material)
    })
  })

  commit('set_jobTasksTemplatesInState', {
    client: order.client,
    loanType: order.loanType,
    templates,
    type,
  })
  return templates
}
