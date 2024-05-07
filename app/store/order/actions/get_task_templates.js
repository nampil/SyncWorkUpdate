import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export async function get_task_templates({ commit }, { type }) {
  if (type === TEMPLATES_TYPES.allowables) {
    type = TEMPLATES_TYPES.workToDos
  }
  const promises = []
  const templates = []
  let q = null
  if (type === TEMPLATES_TYPES.workToDos) {
    q = query(
      collection(db, `admin/config/${type}-templates`),
      where('active', '==', true)
    )
  } else {
    q = query(collection(db, `admin/config/${type}-templates`))
  }

  const querySnapshot = await getDocs(q)

  for (let i = 0; i < querySnapshot.docs.length; i++) {
    const doc = querySnapshot.docs[i]
    const template = {
      ...doc.data(),
      id: doc.id,
      requirements: [],
    }
    templates.push(template)
  }
  for (let index = 0; index < templates.length; index++) {
    const qRequirements = query(
      collection(
        db,
        `admin/config/${type}-templates/${templates[index].id}/requirements`
      )
    )

    promises.push(getDocs(qRequirements))
  }

  const results = await Promise.all(promises)

  results.forEach((querySnapshotRequirements, i) => {
    querySnapshotRequirements.forEach((doc) => {
      const requirement = {
        ...doc.data(),
        id: doc.id,
      }
      templates[i].requirements.push(requirement)
    })
  })

  commit('set_jobTasksTemplates', { templates, type })
}
