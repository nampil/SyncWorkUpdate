export default {
  set_showAlert(state, payload) {
    state.showAlert = payload
  },
  set_text(state, payload) {
    state.text = payload
  },
  set_color(state, payload) {
    state.color = payload || 'secondary'
  },
  set_timeout(state, payload) {
    state.timeout = payload || 5000
  },

  set_top(state, payload) {
    state.top = payload
  },
  set_bottom(state, payload) {
    state.bottom = payload
  },

  set_right(state, payload) {
    state.right = payload
  },
  set_left(state, payload) {
    state.left = payload
  },

  flush_state(state) {
    state.showAlert = false
    state.text = ''
    state.color = ''
    state.timeout = 5000
    state.top = false
    state.right = false
    state.bottom = false
    state.left = false
  },
}
