export default {
  set_winterizationTemplates(state, payload) {
    state.winterizations = payload
  },

  add_winterizationTemplate(state, winterization) {
    state.winterizations.push(winterization)
  },

  update_winterizationTemplate(state, winterization) {
    const idx = state.winterizations.findIndex((i) => i.id === winterization.id)
    if (idx === -1) return
    state.winterizations.splice(idx, 1, winterization)
  },

  remove_winterizationTemplate(state, winterization) {
    const idx = state.winterizations.findIndex((i) => i.id === winterization.id)
    if (idx === -1) return
    state.winterizations.splice(idx, 1)
  },
}
