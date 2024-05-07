import { Timestamp, doc, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { functions, db } from '~/plugins/firebase'

export function get_order({ commit, dispatch, rootState }, { orderId }) {
  const user = rootState.auth.user

  let order = {}
  const docRef = doc(db, 'orders', orderId)
  const unsub = onSnapshot(
    docRef,
    async (doc) => {
      if (doc.exists()) {
        order = {
          ...doc.data(),
          id: doc.id,
          ...(!doc.data().updatedAt && {
            updatedAt: Timestamp.fromDate(new Date()),
          }),
          estimatedCompleteDate:
            doc.data().estimatedCompleteDate === '00-00-00'
              ? ''
              : doc.data().estimatedCompleteDate,
        }

        if (
          user.userCredential?.claims &&
          user.userCredential.claims.authLevels < 9
        ) {
          const addToOrderHistory = httpsCallable(
            functions,
            'addToOrderHistory'
          )

          await addToOrderHistory({
            updatedBy: user.profile,
            type: 'open',
            orderId: doc.id,
          }).catch((error) => {
            // eslint-disable-next-line
            console.log('error: ', error)
          })
        }

        commit('set_order', order)
      }
    },
    (error) => {
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  )
  commit('add_order_listener', unsub)
  dispatch('get_JobTasks', { orderId })
}
