import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { db, auth } from '@/plugins/firebase'

export function get_orders({ commit, dispatch }) {
  const user = auth.currentUser
  if (!user) {
    return
  }

  const initialTime = new Date().getTime()
  let firstLoad = false

  return new Promise((resolve, reject) => {
    commit('set_orders', [])
    commit('remove_orders_listeners')
    // Nos permite cargar las ordenes que no estan archivadas

    const q = query(
      collection(db, 'orders'),
      where('archive', '==', false),
      where('status', 'in', ['idle', 'Inactive', 'Partially complete'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        if (!firstLoad) {
          firstLoad = true
        }
      }
      snapshot.docChanges().forEach((change) => {
        const doc = {
          ...change.doc.data(),
          id: change.doc.id,
          dateDueFormatted: this.$formatDate(
            change.doc.data().dateDue.toDate()
          ),
          dateDueTimestamp: change.doc.data().dateDue.toDate().getTime(),
          assigned: change.doc.data().contractors.length > 0,
          unassigned: change.doc.data().contractors.length === 0,
          estimatedCompleteDate:
            change.doc.data().estimatedCompleteDate === '00-00-00'
              ? ''
              : change.doc.data().estimatedCompleteDate,
          contractorList:
            change.doc.data().contractors?.map((c) => ` ${c.fullName}`) || [],
        }
        if (doc.processor) {
          dispatch(
            'users/get_usersById',
            { usersIds: [doc.processor] },
            { root: true }
          )
        }
        if (change.type === 'added') {
          commit('add_order', doc)
          if (!firstLoad) {
            firstLoad = true
          }
        }
        if (change.type === 'modified') {
          commit('update_order', doc)
        }
        if (change.type === 'removed') {
          const orderToDeleteId = doc.id
          commit('remove_order', orderToDeleteId)
        }
      })
    })
    commit('add_orders_listener', unsubscribe)

    const waitter = setInterval(() => {
      if (firstLoad) {
        resolve({ status: 'Ok', message: 'First load completed' })

        clearInterval(waitter)
      } else if (new Date().getTime() - initialTime > 60000) {
        clearInterval(waitter)
        reject(new Error("Time's up!"))
      }
    }, 200)
  })
}
