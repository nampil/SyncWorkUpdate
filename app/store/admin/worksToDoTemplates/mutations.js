export default {
  set_workToDoTemplates(state, payload) {
    state.worksToDo = payload
  },

  add_workToDoTemplate(state, workToDo) {
    state.worksToDo.push(workToDo)
  },
  update_workToDoTemplate(state, workToDo) {
    const idx = state.worksToDo.findIndex((i) => i.id === workToDo.id)
    if (idx === -1) return
    state.worksToDo.splice(idx, 1, workToDo)
  },

  remove_workToDoTemplate(state, workToDo) {
    const idx = state.worksToDo.findIndex((i) => i.id === workToDo.id)
    if (idx === -1) return
    state.worksToDo.splice(idx, 1)
  },
}
