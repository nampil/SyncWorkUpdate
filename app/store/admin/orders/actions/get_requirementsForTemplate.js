import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
export async function get_requirementsForTemplate(_, { type, templateId }) {
  const requirements = []
  const qRequirements = query(
    collection(db, `admin/config/${type}-templates/${templateId}/requirements`)
  )

  const querySnapshotRequirements = await getDocs(qRequirements)
  let idx = 0

  querySnapshotRequirements.forEach((doc) => {
    const requirement = {
      ...doc.data(),
      id: doc.id,
      position: doc.data().position || idx + 1,
    }
    requirements.push(requirement)
    idx++
  })

  return requirements
}
