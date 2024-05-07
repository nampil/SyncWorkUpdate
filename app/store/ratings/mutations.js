export default {
  add_rating(state, payload) {
    state.ratings.push(payload)
  },
  edit_rating(state, payload) {
    if (!state.ratings.length) return
    const idx = state.ratings.findIndex((rating) => {
      if (!rating) return false
      return rating.id === payload.id
    })
    if (idx === -1) return

    state.ratings.splice(idx, 1, payload)
  },
  delete_rating(state, payload) {
    if (!state.ratings.length) return
    const idx = state.ratings.findIndex((rating) => rating.id === payload.id)
    if (idx === -1) return

    state.ratings.splice(idx, 1)
  },
}
