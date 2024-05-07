export default {
  set_usersTemplates(state, payload) {
    state.usersTemplates = payload
  },
  add_userTemplate(state, user) {
    state.usersTemplates.push(user)
  },
  update_userTemplate(state, user) {
    const idx = state.usersTemplates.findIndex((i) => i.uid === user.uid)
    if (idx === -1) return
    state.usersTemplates.splice(idx, 1, user)
  },
  remove_userTemplate(state, user) {
    const idx = state.usersTemplates.findIndex((i) => i.uid === user.uid)
    if (idx === -1) return
    state.usersTemplates.splice(idx, 1)
  },
}
