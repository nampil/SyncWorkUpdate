export default {
  get_requirementsLastPosition:
    (state) =>
    ({ taskId, type }) => {
      const indexOfTask = state[type].map((t) => t.id).indexOf(taskId)
      const requirements = state[type][indexOfTask].requirements

      if (!requirements.length) {
        return 1
      }

      const result = requirements.reduce((acc, req) => {
        if (req.position >= acc) {
          return acc + 1
        }
        return acc
      }, 1)

      return result + 1
    },

  get_tasksLastPosition:
    (state) =>
    ({ type }) => {
      const tasks = state[type]

      if (!tasks.length) {
        return 1
      }

      const result = tasks.reduce((acc, req) => {
        if (req.position >= acc) {
          return acc + 1
        }
        return acc
      }, 1)

      return result + 1
    },
}
