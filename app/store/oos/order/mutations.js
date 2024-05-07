export default {
  set_loadingOrder(state, payload) {
    state.loadingOrder = payload
  },
  set_order(state, payload) {
    state.order = payload
  },
  set_unsubscribeOrder(state, payload) {
    state.unsubscribeOrder = payload
  },
  set_instructions(state, instructions) {
    state.instructions = instructions.sort((a, b) => a.position - b.position)
  },
  set_unsubscribeInstructions(state, payload) {
    state.unsubscribeInstructions = payload
  },
  set_allowablesPools(state, payload) {
    state.allowablesPools = payload
  },
  set_unsubscribeAllowablesPools(state, payload) {
    state.unsubscribeAllowablesPools = payload
  },

  set_allowables(state, payload) {
    state.allowables = payload
  },

  set_unsubscribeAllowables(state, payload) {
    state.unsubscribeAllowables = payload
  },

  set_workToDos(state, payload) {
    state.workToDos = payload
  },
  set_unsubscribeWorkToDos(state, payload) {
    state.unsubscribeWorkToDos = payload
  },

  set_appointments(state, payload) {
    state.appointments = payload
  },

  set_unsubscribeAppointments(state, payload) {
    state.unsubscribeAppointments = payload
  },
  set_inspections(state, payload) {
    state.inspections = payload
  },
  set_unsubscribeInspections(state, unsubscribe) {
    state.unsubscribeInspections = unsubscribe
  },

  set_showOrderGeneralInfo(state, payload) {
    state.showOrderGeneralInfo = payload
  },

  set_taskSelected(state, payload) {
    state.taskSelected = payload
  },
  set_taskReports(state, payload) {
    state.taskReports = payload
  },
  set_taskReportListener(state, payload) {
    state.taskReportListener = payload
  },

  flush_reports(state, payload) {
    state.taskReports = []
    if (state.taskReportListener) {
      state.taskReportListener()
    }
    state.taskReportListener = null
  },

  flush_state(state) {
    state.order = null
    if (state.unsubscribeOrder) {
      state.unsubscribeOrder()
    }
    state.unsubscribeOrder = null
    if (state.unsubscribeInstructions) {
      state.unsubscribeInstructions()
    }
    state.unsubscribeInstructions = null
    state.instructions = []

    if (state.unsubscribeAllowablesPools) {
      state.unsubscribeAllowablesPools()
    }
    state.unsubscribeAllowablesPools = null
    state.allowablesPools = []

    if (state.unsubscribeAllowables) {
      state.unsubscribeAllowables()
    }
    state.unsubscribeAllowables = null
    state.allowables = []

    if (state.unsubscribeWorkToDos) {
      state.unsubscribeWorkToDos()
    }
    state.unsubscribeWorkToDos = null
    state.workToDos = []

    if (state.unsubscribeAppointments) {
      state.unsubscribeAppointments()
    }
    state.unsubscribeAppointments = null
    state.appointments = []

    if (state.unsubscribeInspections) {
      state.unsubscribeInspections()
    }
    state.unsubscribeInspections = null
    state.inspections = []
  },
}
