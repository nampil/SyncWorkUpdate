import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { JOB_TYPES } from '~/utils/dictionaries'

export async function get_workTemplate(
  { commit, dispatch, rootState },
  { workTemplateId, taskTitle, isEditing }
) {
  const wtRef = doc(
    db,
    `admin/config/${JOB_TYPES.workToDos}-templates/${workTemplateId}`
  )
  const dummyTemplate = rootState.order.dummyTasks[JOB_TYPES.workToDos]

  const workTempleteRes = getDoc(wtRef).then((doc) => {
    if (doc.exists()) {
      return {
        ...dummyTemplate,
        ...doc.data(),
        title: taskTitle || doc.data().title || '',
        desc: doc.data().desc || '',
        id: doc.id,
      }
    } else {
      return {
        ...dummyTemplate,
        id: `local-${this.$generateId()}`,
        title: taskTitle || dummyTemplate.title || '',
      }
    }
  })

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
  // eslint-disable-next-line
  console.log('workTemplete', workTemplete)

  commit('set_workTemplate', objToSave)

  if (isEditing) {
    commit('set_originalWorkTemplate', {
      ...objToSave,
      ...(objToSave.pictures && { pictures: [...objToSave.pictures] }),
      ...(objToSave.materialsOrTools && {
        materialsOrTools: [...objToSave.materialsOrTools],
      }),
      requirements: [...objToSave.requirements],
    })
  }
}
