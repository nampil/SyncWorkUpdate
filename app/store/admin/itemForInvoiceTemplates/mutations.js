export default {
  set_itemForInvoiceTemplates(state, payload) {
    state.itemForInvoiceTemplates = payload
  },

  add_itemForInvoiceTemplate(state, itemForInvoiceTemplate) {
    state.itemForInvoiceTemplates.push(itemForInvoiceTemplate)
  },
  update_itemForInvoiceTemplate(state, itemForInvoiceTemplate) {
    const idx = state.itemForInvoiceTemplates.findIndex(
      (i) => i.id === itemForInvoiceTemplate.id
    )
    if (idx === -1) return
    state.itemForInvoiceTemplates.splice(idx, 1, itemForInvoiceTemplate)
  },

  remove_itemForInvoiceTemplate(state, itemForInvoiceTemplate) {
    const idx = state.itemForInvoiceTemplates.findIndex(
      (i) => i.id === itemForInvoiceTemplate.id
    )
    if (idx === -1) return
    state.itemForInvoiceTemplates.splice(idx, 1)
  },
  set_originalWorkTemplate(state, payload) {
    state.originalWorkTemplate = payload
  },
  set_workTemplate(state, payload) {
    state.workTemplate = payload
  },
  update_workTemplate(state, update) {
    state.workTemplate = {
      ...state.workTemplate,
      ...update,
      ...(update.requirements && { requirements: [...update.requirements] }),
      ...(update.pictures && { pictures: [...update.pictures] }),
    }
  },
  set_workTemplateValidation(state, payload) {
    state.workTemplateValidation = payload
  },
  add_requirementsToWorkTemplate(state, requirements) {
    if (!state.workTemplate?.requirements) return

    state.workTemplate.requirements.push(...requirements)
  },
  add_requirementsToWorkTemplateOnIdx(state, { reqToAdd, idx }) {
    if (!state.workTemplate?.requirements) return

    state.workTemplate.requirements.splice(idx, 0, reqToAdd)
  },

  update_requirementOnWorkTemplate(state, reqToUpdate) {
    if (!state.workTemplate?.requirements) return

    const idx = state.workTemplate.requirements.findIndex(
      (r) => r.id === reqToUpdate.id
    )
    if (idx === -1) return
    state.workTemplate.requirements.splice(idx, 1, reqToUpdate)
  },

  delete_requirementOnWorkTemplate(state, reqId) {
    if (!state.workTemplate?.requirements) return

    const idx = state.workTemplate.requirements.findIndex((r) => r.id === reqId)
    if (idx === -1) return
    state.workTemplate.requirements.splice(idx, 1)
  },

  add_pictureToWorkTemplate(state, pic) {
    if (!state.workTemplate?.pictures) return
    state.workTemplate.pictures.push(pic)
  },
  add_fileToWorkTemplate(state, file) {
    if (!state.workTemplate?.files) return
    state.workTemplate.files.push(file)
  },

  delete_pictureFromWorkTemplate(state, pic) {
    if (!state.workTemplate?.pictures || !pic) return
    const picIdx = state.workTemplate.pictures.findIndex(
      (p) => p.codeName === pic.codeName
    )
    if (picIdx > -1) {
      state.workTemplate.pictures.splice(picIdx, 1)
    }

    if (state.workTemplate.files?.length) {
      const fileIdx = state.workTemplate.files.findIndex(
        (f) => f.codeName === pic.codeName
      )
      if (fileIdx > -1) state.workTemplate.files.splice(fileIdx, 1)
    }
  },
}
