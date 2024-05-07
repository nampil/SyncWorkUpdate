import { collection, getDocs, or, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reportsForDawnload(
  _,
  { orderId, requirements, task, type }
) {
  if (!orderId || !task) {
    throw new Error('Not precondition')
  }
  const reportsRef = collection(
    db,
    `orders/${orderId}/${task.type}/${task.id}/reports`
  )
  const _type = `${type}`.toLowerCase()

  let q = {}
  if (_type === 'general') {
    q = query(
      reportsRef,
      or(
        where(`fromRequirement`, '==', false),
        (where('fromRequirement', '==', true),
        where(
          'requirementId',
          'in',
          requirements.map((e) => e.id)
        ))
      )
    )
  } else {
    q = query(
      reportsRef,
      or(
        where(`${_type}`, '==', true),
        (where('fromRequirement', '==', true),
        where(
          'requirementId',
          'in',
          requirements.map((e) => e.id)
        ))
      )
    )
  }

  const querySnapshot = await getDocs(q)
  const reports = []

  querySnapshot.forEach((doc) => {
    const report = {
      ...doc.data(),
      id: doc.id,
    }
    reports.push(report)
  })

  return reports
}
