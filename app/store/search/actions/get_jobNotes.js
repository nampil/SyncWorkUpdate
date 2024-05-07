import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { JOB_NOTES_TYPES } from '~/utils/dictionaries'
export async function get_jobNotes(_, { orderId, propertyId }) {
  const jobNotes = []

  const workOrdersNotesQuery = query(
    collection(db, `orders/${orderId}/jobNotes`),
    where('noteType', '==', JOB_NOTES_TYPES.workOrderNotes)
  )
  const propertyNotesQuery = query(
    collectionGroup(db, 'jobNotes'),
    where('noteType', '==', JOB_NOTES_TYPES.propertyNotes),
    where('propertyId', '==', propertyId)
  )

  const workOrderNotesSnapshot = await getDocs(workOrdersNotesQuery)
  workOrderNotesSnapshot.forEach((doc) => {
    const jobNote = { ...doc.data(), id: doc.id }
    jobNotes.push(jobNote)
  })

  const propertyNotesSnapshot = await getDocs(propertyNotesQuery)
  propertyNotesSnapshot.forEach((doc) => {
    const jobNote = { ...doc.data(), id: doc.id }
    jobNotes.push(jobNote)
  })
  return jobNotes
}
