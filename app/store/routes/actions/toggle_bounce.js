export function toggle_bounce({ state, commit }, { animation, orderId }) {
  const marker = state.markers.filter((m) => {
    return m.id === orderId
  })[0]

  if (!marker) {
    return
  }
  const objectToUpdate = {
    animation,
  }

  commit('update_marker', { id: orderId, objectToUpdate })
}
