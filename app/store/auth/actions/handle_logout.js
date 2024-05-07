import { signOut } from 'firebase/auth'
import { auth } from '~/plugins/firebase'

export async function handle_logout({ commit }, haveToSingOut) {
  if (haveToSingOut) {
    await signOut(auth)
  }

  commit('logout')
  commit('chats/flush_state', null, { root: true })
  commit('order/flush_state', null, { root: true })
  commit('order/detach_listeners', null, { root: true })
  commit('orders/flush_state', null, { root: true })
  commit('orderHistory/flush_state', null, { root: true })
  // commit('alert/flush_state', null, { root: true })
  // TODO: Completar todo los flush de la store
  // commit('admin/orders/flush_state', null, { root: true })
  // commit('admin/users/flush_state', null, { root: true })
}
