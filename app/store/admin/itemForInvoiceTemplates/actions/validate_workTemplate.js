export function validate_workTemplate({ state, commit }) {
  const workTemplateValidation = {
    desc: true,
    requirements: true,
  }

  if (state.workTemplate) {
    const workTemplate = state.workTemplate
    if (!workTemplate.desc) {
      workTemplateValidation.desc = false
    }
    if (!workTemplate.requirements || !workTemplate.requirements.length) {
      workTemplateValidation.requirements = false
    }
  }

  commit('set_workTemplateValidation', workTemplateValidation)

  const isValid = Object.values(workTemplateValidation).every((v) => v === true)
  // eslint-disable-next-line
  console.log('isValid', isValid)

  return isValid
}
