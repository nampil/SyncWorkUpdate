export default {
  isValidWorkTemplate(state) {
    const workTemplate = state.workTemplate

    if (!workTemplate) {
      return false
    }

    if (!workTemplate.desc) {
      return false
    }
    if (!workTemplate.requirements || !workTemplate.requirements.length) {
      return false
    }

    return true
  },

  materialsOrToolsDelete(state) {
    if (!state.originalWorkTemplate || !state.workTemplate) return null

    return state.originalWorkTemplate.materialsOrTools?.filter((item) => {
      return !state.workTemplate.materialsOrTools
        .map((e) => e.id)
        .includes(item.id)
    })
  },
  newMaterialsOrTools(state) {
    if (!state.originalWorkTemplate || !state.workTemplate) {
      return null
    }
    if (!state.originalWorkTemplate.materialsOrTools) {
      return state.workTemplate.materialsOrTools
    }
    return state.workTemplate.materialsOrTools.filter((item) => {
      return !state.originalWorkTemplate.materialsOrTools
        .map((e) => e.id)
        .includes(item.id)
    })
  },
}
