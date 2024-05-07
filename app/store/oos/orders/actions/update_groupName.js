import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_groupName({ _ }, { routeId, groupName }) {
  const routeRef = doc(collection(db, `routes`), routeId)
  await updateDoc(routeRef, { groupName })
}
