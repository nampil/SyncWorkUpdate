import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '@/utils/dictionaries'
export async function get_tasks_templates_active(_, type) {
  const templates = []

  const q = query(
    collection(db, `admin/config/${type}-templates`),
    where('active', '==', true)
  )
  const querySnapshot = await getDocs(q)

  for (let i = 0; i < querySnapshot.docs.length; i++) {
    const doc = querySnapshot.docs[i]

    const template = {
      ...doc.data(),
      id: doc.id,

      ...(type === TEMPLATES_TYPES.workToDos && {
        requirements: [],
      }),
    }
    templates.push(template)
  }
  return templates
}
