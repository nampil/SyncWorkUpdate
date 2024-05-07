import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export async function get_relativeItems(_, title) {
  const items = []
  const type = TEMPLATES_TYPES.workToDos
  const q = query(
    collection(db, `admin/config/${type}-templates`),
    where('title', '==', title)
  )

  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    items.push({
      ...doc.data(),
      id: doc.id,
    })
  })
  return items
}
