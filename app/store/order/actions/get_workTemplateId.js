import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { JOB_TYPES } from '~/utils/dictionaries'

export async function get_workTemplateId({ dispatch }, { workTemplateId }) {
  const wtRef = doc(
    db,
    `admin/config/${JOB_TYPES.workToDos}-templates/${workTemplateId}`
  )

  const workTempleteRes = getDoc(wtRef).then((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))

  const requirementsRes = dispatch(
    'admin/orders/get_requirementsForTemplate',
    {
      type: JOB_TYPES.workToDos,
      templateId: workTemplateId,
    },
    { root: true }
  )
  const materialsOrToolsRes = dispatch(
    'admin/orders/get_materialsOrToolsForTemplate',
    { type: JOB_TYPES.workToDos, templateId: workTemplateId },
    { root: true }
  )

  const results = await Promise.all([
    workTempleteRes,
    requirementsRes,
    materialsOrToolsRes,
  ])

  const [workTemplete, requirements, materialsOrTools] = results

  const objToSave = { ...workTemplete, requirements, materialsOrTools }

  return objToSave
}
