import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'

import { db } from '~/plugins/firebase'
import { JOB_TYPES } from '~/utils/dictionaries'

export function get_orderSelected({ state, commit, dispatch }, orderId) {
  return new Promise((resolve, reject) => {
    if (state.order && state.order.id === orderId) {
      return resolve()
    }
    commit('set_loadingOrder', true)
    commit('flush_state')
    let firstLoaded = false

    const orderRef = doc(db, 'orders', orderId)

    const getInstructions = () => {
      const instructionsRef = collection(
        db,
        `orders/${orderId}/${JOB_TYPES.instructions}`
      )

      const unsubscribe = onSnapshot(instructionsRef, (snapshot) => {
        const instructions = []
        snapshot.forEach((doc) => {
          instructions.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        commit('set_instructions', instructions)
      })
      commit('set_unsubscribeInstructions', unsubscribe)
    }

    const getAllowablesPools = () => {
      const allowablesPoolsRef = collection(
        db,
        `orders/${orderId}/${JOB_TYPES.allowablesPools}`
      )

      const unsubscribe = onSnapshot(allowablesPoolsRef, (snapshot) => {
        const allowablesPools = []

        snapshot.forEach((doc) => {
          allowablesPools.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        commit('set_allowablesPools', allowablesPools)
      })
      commit('set_unsubscribeAllowablesPools', unsubscribe)
    }

    const getAllowables = () => {
      const allowablesRef = collection(
        db,
        `orders/${orderId}/${JOB_TYPES.allowables}`
      )

      const unsubscribe = onSnapshot(allowablesRef, (snapshot) => {
        const allowables = []
        if (orderId === 'BsMHyVbPa2ho8WxQcLzt') {
          // eslint-disable-next-line
          console.log('getAllowables snapshot size', snapshot.size)
        }
        snapshot.forEach((doc) => {
          allowables.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        commit('set_allowables', allowables)
      })
      commit('set_unsubscribeAllowables', unsubscribe)
    }

    const getWorkToDos = () => {
      const workToDosRef = collection(
        db,
        `orders/${orderId}/${JOB_TYPES.workToDos}`
      )
      const unsubscribe = onSnapshot(workToDosRef, (snapshot) => {
        const workToDos = []
        snapshot.forEach((doc) => {
          workToDos.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        commit('set_workToDos', workToDos)
      })
      commit('set_unsubscribeWorkToDos', unsubscribe)
    }

    const getInspections = () => {
      const inspectionsRef = collection(
        db,
        `orders/${orderId}/${JOB_TYPES.inspections}`
      )

      const q = query(inspectionsRef, orderBy('createdAt', 'asc'))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const inspections = []
        let position = 0
        snapshot.forEach((doc) => {
          inspections.push({
            ...doc.data(),
            id: doc.id,
          })
          position++
        })

        commit('set_inspections', inspections)
      })
      commit('set_unsubscribeInspections', unsubscribe)
    }

    const getAppoinments = () => {
      const appointmentsRef = collection(
        db,
        `orders/${orderId}/${JOB_TYPES.appointments}`
      )
      const unsubscribe = onSnapshot(appointmentsRef, (snapshot) => {
        const appointments = []
        snapshot.forEach((doc) => {
          appointments.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        commit('set_appointments', appointments)
      })
      commit('set_unsubscribeAppointments', unsubscribe)
    }

    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (!firstLoaded) {
        commit('set_loadingOrder', false)
        firstLoaded = true

        resolve()
      }
      const order = {
        ...doc.data(),
        id: doc.id,
      }

      if (!state.unsubscribeAllowablesPools) {
        getAllowablesPools()
      }
      if (!state.unsubscribeAllowables) {
        getAllowables()
      }
      if (!state.unsubscribeInstructions) {
        getInstructions()
      }
      if (!state.unsubscribeWorkToDos) {
        getWorkToDos()
      }
      if (!state.unsubscribeAppointments) {
        getAppoinments()
      }
      if (!state.unsubscribeInspections) {
        getInspections()
      }

      commit('set_order', order)
    })

    commit('set_unsubscribeOrder', unsubscribe)
  })
}
