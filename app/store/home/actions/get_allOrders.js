import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db, auth } from '~/plugins/firebase'

export function get_allOrders({ commit, dispatch }, { filters, allOrders }) {
  const user = auth.currentUser
  if (!user) {
    return
  }

  const initialTime = new Date().getTime()
  let firstLoad = false
  return new Promise((resolve, reject) => {
    commit('set_allOrders', [])
    commit('remove_allOrders_listeners')
    const ordersRef = collection(db, 'orders')
    const queryConstraints = []

    const filtersFinal = []
    for (let i = 0; i < Object.entries(filters).length; i++) {
      const filter = Object.entries(filters)[i]
      const key = filter[0]
      const value = filter[1]
      filtersFinal.push({
        key,
        value,
      })
    }
    if (filtersFinal && filtersFinal.length) {
      filtersFinal.forEach(({ key, value }) => {
        if (key === 'contractor' && value) {
          queryConstraints.push(
            where('contractorsUids', 'array-contains', value.uid)
          )
        }
        if (key === 'status' && value.length > 0) {
          const statusList = value.map((status) => status)
          if (statusList.includes('Inactive')) {
            statusList.push('idle')
          }

          queryConstraints.push(where(key, 'in', statusList))
        }
        if (key === 'archive') {
          queryConstraints.push(where('archive', '==', value))
        }
        if (key === 'unassigned' && value && !allOrders) {
          queryConstraints.push(where('assigned', '==', false))
        }
        if (
          key !== 'status' &&
          key !== 'contractor' &&
          key !== 'unassigned' &&
          value &&
          !allOrders
        ) {
          queryConstraints.push(where(key, '==', value))
        }
      })
    }

    const q = query(ordersRef, ...queryConstraints)
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

        // if (doc.processor) {
        //   dispatch(
        //     'users/get_usersById',
        //     { usersIds: [doc.processor] },
        //     { root: true }
        //   )
        // }

        if (change.type === 'added') {
          commit('add_allOrder', doc)
          if (!firstLoad) {
            firstLoad = true
          }
        }
        if (change.type === 'modified') {
          commit('update_allOrder', doc)
        }
        if (change.type === 'removed') {
          const orderToDeleteId = doc.id
          commit('remove_allOrder', orderToDeleteId)
        }
      })
    })

    commit('add_allOrders_listener', unsubscribe)
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
