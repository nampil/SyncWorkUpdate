export function handleAlert({ commit }, payload) {
  const { showAlert, text, color, timeout, top, bottom, left, right } = payload

  if (showAlert) {
    commit('set_showAlert', showAlert)
    commit('set_text', text)
    commit('set_color', color)
    commit('set_timeout', timeout)
    commit('set_top', top ?? (!top && !bottom && !left && !right))
    commit('set_right', right ?? false)
    commit('set_bottom', bottom ?? false)
    commit('set_left', left ?? false)
  } else {
    commit('set_showAlert', false)
    commit('set_text', '')
    commit('set_color', 'secondary')
    commit('set_timeout', '5000')
    commit('set_top', true)
    commit('set_right', false)
    commit('set_bottom', false)
    commit('set_left', false)
  }
}
