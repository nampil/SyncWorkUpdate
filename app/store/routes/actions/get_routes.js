import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export function get_routes({ state, commit }, forDateStr) {
  // eslint-disable-next-line
  console.log('Get Routes', forDateStr)

  const initialTime = new Date().getTime()
  let firstLoad = false

  // eslint-disable-next-line
  console.log('state.routes.length', state.routes.length)

  if (state.routes.length) {
    commit('detach_listeners')
    commit('flush_state')
  }

  return new Promise((resolve, reject) => {
    const q = query(
      collection(db, 'routes'),
      where('forDateStr', '==', forDateStr)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!firstLoad) {
        firstLoad = true
      }
      snapshot.docChanges().forEach((change) => {
        const doc = {
          ...change.doc.data(),
          id: change.doc.id,
        }
        if (change.type === 'added') {
          commit('add_route', doc)
        }
        if (change.type === 'modified') {
          commit('update_route', doc)
        }
        if (change.type === 'removed') {
          commit('remove_route', doc.id)
        }
      })
    })

    commit('add_listener', unsubscribe)

    const waitter = setInterval(() => {
      if (firstLoad) {
        clearInterval(waitter)
        resolve({ status: 'Ok', message: 'First load completed' })
      } else if (new Date().getTime() - initialTime > 60000) {
        clearInterval(waitter)
        reject(new Error("Time's up!"))
      }
    }, 200)
  })
}
