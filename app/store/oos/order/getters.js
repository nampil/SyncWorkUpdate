import { JOB_TYPES } from '~/utils/dictionaries'

export default {
  getTaskSelect(state, getters, rootState) {
    const taskSelected = state.taskSelected
    const selectOrder = rootState.oos.routes.selectOrder
    const selectRoute = rootState.oos.routes.selectRoute
    let task = null

    if (!taskSelected || !selectOrder || !selectRoute) {
      return null
    }

    const tasksType = [
      JOB_TYPES.allowables,
      JOB_TYPES.allowablesPools,
      JOB_TYPES.inspections,
      JOB_TYPES.workToDos,
    ]

    for (let i = 0; i < tasksType.length; i++) {
      const type = tasksType[i]

      if (!state[type]) {
        continue
      }

      const _task = state[type].find((task) => task.id === taskSelected)
      if (_task) {
        task = _task
        break
      }
    }

    if (task) {
      const indexOfReqList = rootState.oos.orders.requirementsListMap.findIndex(
        (rl) => {
          return (
            rl.taskId === task.id &&
            rl.taskType === task.type &&
            rl.orderId === selectOrder
          )
        }
      )

      if (indexOfReqList === -1) {
        return task
      }
      const requirements =
        rootState.oos.orders.requirementsListMap[indexOfReqList].requirements ||
        []
      task.requirements = requirements
    }

    return task
  },
}
