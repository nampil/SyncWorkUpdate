export function autocomplete_requirementOnWorkTemplate(
  { state, commit },
  { requirementsForAutocomplete }
) {
  if (!state.workTemplate?.requirements) return
  if (!requirementsForAutocomplete?.length) return

  let originalIdx = state.workTemplate.requirements.length - 1
  const reqsToAdd = []

  requirementsForAutocomplete.forEach((req) => {
    const reqIdx = state.workTemplate.requirements.findIndex(
      (_req) => _req.id === req.id
    )
    if (reqIdx === -1) {
      const id = 'localReq' + this.$generateId()
      reqsToAdd.push({ ...req, id })
    } else {
      originalIdx = reqIdx
      commit('update_requirementOnWorkTemplate', req)
    }
  })

  reqsToAdd.forEach((reqToAdd, i) => {
    commit('add_requirementsToWorkTemplateOnIdx', {
      reqToAdd,
      idx: originalIdx + 1,
    })
  })
}
