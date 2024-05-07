export function duplicate_requirement(
  { state, commit },
  { requirement, taskId, processTime }
) {
  const task = state.workTemplate
  const requirements = task.requirements
  const idxToDuplicate = requirements.findIndex(
    (req) => req.id === requirement.id
  )
  const req = requirements[idxToDuplicate]
  const oldDescRequirement = req.descRequirement.trim()

  const indexOfCopyText = oldDescRequirement.indexOf(' (copy')

  let descRequirement

  if (indexOfCopyText > -1) {
    const indexOfClosingBracked = oldDescRequirement.indexOf(
      ')',
      indexOfCopyText
    )
    const descFirstPart = oldDescRequirement.slice(0, indexOfCopyText)
    const descLastPart = oldDescRequirement.slice(indexOfClosingBracked + 1)

    const copyNumber = requirements
      .map((r) => r.descRequirement)
      .filter(
        (desc) => desc.includes(descFirstPart) && desc.includes(' (copy')
      ).length

    const copyText = ` (copy ${copyNumber + 1})`
    descRequirement = `${descFirstPart}${copyText}${
      descLastPart ? ' ' + descLastPart : ''
    }`
  } else {
    descRequirement = oldDescRequirement + ' (copy)'
  }

  const id = 'localReq' + this.$generateId()
  const pictures = req.pictures?.length ? [...req.pictures] : []
  const newReq = {
    ...req,
    id,
    position: req.position + 1,
    isDuplicated: true,
    originReqId: req.id,
    descRequirement,
    files: req.files?.length ? [...req.files] : [],
    pictures,
  }
  commit('add_requirementsToWorkTemplateOnIdx', {
    reqToAdd: newReq,
    idx: idxToDuplicate + 1,
  })
}
