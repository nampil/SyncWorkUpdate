import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_userData({ commit, dispatch }, uid) {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef).catch((error) => {
    // eslint-disable-next-line
    console.log('error', error)

    this.$mainAlertError('Please login again')
  })

  if (!docSnap) {
    dispatch('handle_logout', true)
  }

  if (docSnap.exists()) {
    const _userData = docSnap.data()
    commit('set_user_profile', _userData)
  } else {
    dispatch('handle_logout', true)
    this.$mainAlertError('Please login again')
    const error = new Error('No such document!')
    throw error
  }
}
