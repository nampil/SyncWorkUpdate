import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_templatesForLoanTypes(_, { type, loanType }) {
  const templates = []
  const templatesRef = collection(db, `admin/config/${type}-templates`)
  const queryConstraints = []

  if (loanType) {
    queryConstraints.push(where('loanTypes', 'array-contains', loanType))
  }
  const q = query(templatesRef, ...queryConstraints)
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    const template = {
      ...doc.data(),
      id: doc.id,
    }
    templates.push(template)
  })
  return templates
}
