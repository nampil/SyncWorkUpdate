export default {
  set_notes: (state, notes) => (state.notes = notes),
  add_note: (state, note) => state.notes.push(note),
  update_note: (state, note) => {
    const idx = state.notes.findIndex((n) => n.id === note.id)
    if (idx < 0) return
    state.notes.splice(idx, 1, note)
  },
  delete_note: (state, note) => {
    const idx = state.notes.findIndex((n) => n.id === note.id)
    if (idx < 0) return
    state.notes.splice(idx, 1)
  },
  set_notesUnsubscriber: (state, unsubscriber) => {
    if (state.notesUnsubscriber) {
      state.notesUnsubscriber()
    }
    state.notesUnsubscriber = unsubscriber
  },

  set_posX(state, payload) {
    state.posX = payload
  },
  set_posY(state, payload) {
    state.posY = payload
  },
  set_minimize(state, payload) {
    state.minimize = payload
  },

  flush_state: (state) => {
    state.notes = []
    if (state.notesUnsubscriber) {
      state.notesUnsubscriber()
    }
    state.notesUnsubscriber = null
  },
}
