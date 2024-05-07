export default {
  set_history(state, payload) {
    state.history = payload
  },
  flush_state(state) {
    state.history = []
  },
}
