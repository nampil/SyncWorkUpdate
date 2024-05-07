import {
  Timestamp,
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { JOB_NOTES_TYPES } from '~/utils/dictionaries'

export async function get_jobNotes_for_order(
  { dispatch, commit, state },
  { orderId, propertyId }
) {
  const currentOrderIdForListener = state.orderIdForListener
  if (currentOrderIdForListener === orderId) {
    return
  }

  commit('flush_jobNotesState')

  const getJobNotesForOrder = new Promise((resolve, reject) => {
    const initialTime = new Date().getTime()
    let firstLoad = false

    const q = query(
      collection(db, `orders/${orderId}/jobNotes`),
      where('noteType', '==', JOB_NOTES_TYPES.workOrderNotes)
    )

    const listener = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        firstLoad = true
      }
      snapshot.docChanges().forEach(async (change) => {
        const jobNote = { ...change.doc.data(), id: change.doc.id }
        if (!jobNote.updatedAt) {
          jobNote.updatedAt = Timestamp.fromDate(new Date())
        }
        if (jobNote.noteToUid && jobNote.noteToUid.length) {
          jobNote.noteTo = await dispatch('get_userNoteTo', {
            userUids: jobNote.noteToUid,
          })
        }
        if (change.type === 'added') {
          if (!firstLoad) {
            firstLoad = true
          }
          commit('add_jobNote', jobNote)
        }
        if (change.type === 'modified') {
          commit('update_jobNote', jobNote)
        }
        if (change.type === 'removed') {
          commit('remove_jobNote', jobNote)
        }
      })
    })
    commit('set_jobNotesListener', { listener, orderIdForListener: orderId })

    const waitter = setInterval(() => {
      if (firstLoad) {
        clearInterval(waitter)
        resolve(this.$i18n.t('jobNotesState'))
      } else if (new Date().getTime() - initialTime > 60000) {
        clearInterval(waitter)
        reject(new Error(`Time's up! ${orderId}`))
      }
    }, 200)
  })

  const getJobNotesForProperty = new Promise((resolve, reject) => {
    const initialTime = new Date().getTime()
    let firstLoad = false

    const q = query(
      collectionGroup(db, 'jobNotes'),
      where('noteType', '==', JOB_NOTES_TYPES.propertyNotes),
      where('propertyId', '==', propertyId)
    )

    const listener = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        firstLoad = true
      }

      snapshot.docChanges().forEach(async (change) => {
        const jobNote = { ...change.doc.data(), id: change.doc.id }
        if (!jobNote.updatedAt) {
          jobNote.updatedAt = Timestamp.fromDate(new Date())
        }
        if (jobNote.noteToUid && jobNote.noteToUid.length) {
          jobNote.noteTo = await dispatch('get_userNoteTo', {
            userUids: jobNote.noteToUid,
          })
        }
        if (change.type === 'added') {
          if (!firstLoad) {
            firstLoad = true
          }
          commit('add_jobNote', jobNote)
        }
        if (change.type === 'modified') {
          commit('update_jobNote', jobNote)
        }
        if (change.type === 'removed') {
          commit('remove_jobNote', jobNote)
        }
      })
    })
    commit('set_propertyJobNotesListener', {
      listener,
      propertyIdForListener: propertyId,
    })

    const waitter = setInterval(() => {
      if (firstLoad) {
        clearInterval(waitter)
        resolve(this.$i18n.t('jobNotesState'))
      } else if (new Date().getTime() - initialTime > 60000) {
        clearInterval(waitter)
        reject(new Error(`Time's up! ${orderId}`))
      }
    }, 200)
  })

  return await Promise.all([getJobNotesForOrder, getJobNotesForProperty])
}
