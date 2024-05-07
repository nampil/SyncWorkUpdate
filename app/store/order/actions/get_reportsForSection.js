import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { PROCESS_TIME_TYPES } from '~/utils/dictionaries'

export async function get_reportsForSection(
  _,
  {
    orderId,
    processTime,
    forRequirements,
    requirement,
    requirements,
    area,
    task,
    isCount,
  }
) {
  if (
    !orderId ||
    !task ||
    (processTime === PROCESS_TIME_TYPES.inspection && !area)
  ) {
    throw new Error('Not precondition')
  }
  const reportsRef = collection(
    db,
    `orders/${orderId}/${task.type}/${task.id}/reports`
  )

  let q = null

  switch (processTime) {
    case PROCESS_TIME_TYPES.before:
      q = query(reportsRef, where('before', '==', true))
      break
    case PROCESS_TIME_TYPES.during:
      q = query(reportsRef, where('during', '==', true))
      break
    case PROCESS_TIME_TYPES.after:
      q = query(reportsRef, where('after', '==', true))
      break
    case PROCESS_TIME_TYPES.generalReports:
      q = query(reportsRef, where('fromRequirement', '==', false))
      break
    case PROCESS_TIME_TYPES.inspection:
      q = query(reportsRef, where('area', '==', area))
      break
  }
  if (forRequirements) {
    q = query(
      reportsRef,
      where('fromRequirement', '==', true),
      where('requirementId', '==', requirement.id)
    )
  }

  if (isCount) {
    const snapshotReports = await getCountFromServer(q)
    const countReports = snapshotReports.data().count
    if (countReports > 0) {
      return { countReports }
    }

    if (
      requirements &&
      requirements.length > 0 &&
      (processTime === PROCESS_TIME_TYPES.before ||
        processTime === PROCESS_TIME_TYPES.during ||
        processTime === PROCESS_TIME_TYPES.after)
    ) {
      q = query(
        reportsRef,
        where('fromRequirement', '==', true),
        where(
          'requirementId',
          'in',
          requirements.map((e) => e.id)
        )
      )
      const snapshot = await getCountFromServer(q)
      return { allReports: snapshot.data().count }
    } else {
      return { countReports }
    }
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
