export default {
  /*  ----------------------
         Order Mutations
      ---------------------- */
  set_order(state, doc) {
    const _order = {
      ...state.dummyOrder,
      ...doc,
    }
    state.order = {
      ..._order,
      dateDueStr: this.$formatDate(doc.dateDue.toDate()),
    }
  },

  /*  ----------------------
         JobTasks Mutations
      ---------------------- */

  add_job_task(state, { doc, type }) {
    state[type].push({
      ...doc,
      type,
    })
  },
  update_job_task(state, { doc, type }) {
    const indexToUpdate = state[type].map((jt) => jt.id).indexOf(doc.id)
    const jobTaskOld = state[type][indexToUpdate]

    const jobTaskUpdated = { ...jobTaskOld, ...doc }

    state[type].splice(indexToUpdate, 1, jobTaskUpdated)
  },
  remove_job_task(state, { docId, type }) {
    const indexToUpdate = state[type].map((jt) => jt.id).indexOf(docId)
    state[type].splice(indexToUpdate, 1)
  },

  /* Requiremets */
  add_task_requirements(state, { doc, type, taskId }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)
    if (indexOfTask === -1) return
    state[type][indexOfTask].requirements.push(doc)
  },

  update_task_requirements(state, { doc, type, taskId }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)
    if (indexOfTask === -1) return
    const indexOfRequirement = state[type][indexOfTask].requirements.findIndex(
      (requirement) => requirement.id === doc.id
    )

    if (indexOfRequirement > -1) {
      state[type][indexOfTask].requirements.splice(indexOfRequirement, 1, doc)
    }
  },
  remove_task_requirements(state, { docId, type, taskId }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)

    if (indexOfTask === -1) return
    const indexOfRequirement = state[type][indexOfTask].requirements.findIndex(
      (requirement) => requirement.id === docId
    )

    if (indexOfRequirement > -1) {
      state[type][indexOfTask].requirements.splice(indexOfRequirement, 1)
    }
  },

  add_jobTaskRequirementsListeners(state, unsubscribe) {
    state.taskRequirementListeners.push(unsubscribe)
  },

  /* Materials Or Tools */
  add_task_materialsOrTools(state, { doc, type, taskId }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)
    if (indexOfTask === -1) return
    state[type][indexOfTask].materialsOrTools.push(doc)
  },

  update_task_materialsOrTools(state, { doc, type, taskId }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)
    if (indexOfTask === -1) return
    const indexOfMaterial = state[type][indexOfTask].materialsOrTools.findIndex(
      (m) => m.id === doc.id
    )

    if (indexOfMaterial > -1) {
      state[type][indexOfTask].materialsOrTools.splice(indexOfMaterial, 1, doc)
    }
  },
  remove_task_materialsOrTools(state, { docId, type, taskId }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)

    if (indexOfTask === -1) return
    const indexOfMaterial = state[type][indexOfTask].materialsOrTools.findIndex(
      (m) => m.id === docId
    )

    if (indexOfMaterial > -1) {
      state[type][indexOfTask].materialsOrTools.splice(indexOfMaterial, 1)
    }
  },

  add_jobTaskMaterialsOrToolsListeners(state, unsubscribe) {
    state.taskMaterialsOrToolsListeners.push(unsubscribe)
  },
  set_jobTaskReports(state, { reports, taskId, type }) {
    const indexOfTask = state[type].findIndex((task) => task.id === taskId)
    state[type][indexOfTask].reports = reports
  },

  /*  ----------------------
           Job Notes Mutations
        ---------------------- */

  set_goToJobNote(state, payload) {
    state.goToJobNote = payload
  },

  set_jobNotes(state, payload) {
    state.jobNotes = payload
  },

  add_jobNote(state, payload) {
    state.jobNotes.push(payload)
  },

  remove_jobNote(state, jobNote) {
    const indexToRemove = state.jobNotes.map((j) => j.id).indexOf(jobNote.id)
    /* splice elimina o agrega un elemento al arreglo */
    state.jobNotes.splice(indexToRemove, 1)

    // state.jobNotes = state.jobNotes.filter(function(e){
    //   return e.id !== payload.id
    // });
  },

  update_jobNote(state, jobNote) {
    const indexToUpdate = state.jobNotes.map((j) => j.id).indexOf(jobNote.id)
    state.jobNotes.splice(indexToUpdate, 1, { ...jobNote })

    // state.jobNotes = state.jobNotes.map(function(e){
    //   if(e.id === payload.id){
    //     e = payload
    //   }
    //   return e
    // });
  },
  set_jobNotesListener(state, { listener, orderIdForListener }) {
    state.jobNotesListener = listener
    if (orderIdForListener) {
      state.orderIdForListener = orderIdForListener
    }
  },

  set_propertyJobNotesListener(state, { listener, propertyIdIdForListener }) {
    state.propertyJobNotesListener = listener

    if (propertyIdIdForListener) {
      state.propertyIdIdForListener = propertyIdIdForListener
    }
  },

  set_showJobNotesDrawer(state, payload) {
    state.showJobNotesDrawer = payload
  },

  /*  ----------------------
           Property History Mutations
        ---------------------- */

  set_showPropertyHistoryDrawer(state, payload) {
    state.showPropertyHistoryDrawer = payload
  },

  /*  ----------------------
           Invoice Mutations
        ---------------------- */
  set_invoice(state, invoiceData) {
    state.invoice = invoiceData
  },

  add_invoice(state, invoice) {
    state.invoice.push(invoice)
  },
  /* Templates */
  set_jobTasksTemplates(state, { templates, type }) {
    state.jobTasksTemplates[type] = templates
  },
  set_jobTasksTemplatesInState(state, { client, loanType, templates, type }) {
    state.jobTasksTemplatesInState[type] = {
      templates,
      client,
      loanType,
    }
  },

  /*  ----------------------
      Order Listeners Mutations
      ---------------------- */
  add_order_listener(state, listener) {
    state.orderListener = listener
  },

  add_jobTaskListeners_listeners(state, listeners) {
    listeners.forEach((listener) => {
      state.jobTaskListeners.push(listener)
    })
  },
  add_inspections_subTasks_listeners(state, listener) {
    state.inspectionsSubtasksListeners.push(listener)
  },
  add_allowables_subTasks_listeners(state, listener) {
    state.allowablesSubtasksListeners.push(listener)
  },
  add_workToDos_subTasks_listeners(state, listener) {
    state.workToDosSubtasksListeners.push(listener)
  },

  detach_listeners(state) {
    if (state.orderListener) {
      state.orderListener()
    }

    state.inspectionsSubtasksListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    state.allowablesSubtasksListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    state.workToDosSubtasksListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    state.jobTaskListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    if (state.jobNotesListener) {
      state.jobNotesListener()
    }
  },
  flush_jobNotesState(state) {
    if (state.jobNotesListener) {
      state.jobNotesListener()
      state.jobNotesListener = null
      state.orderIdForListener = ''
    }
    if (state.propertyJobNotesListener) {
      state.propertyJobNotesListener()
      state.propertyJobNotesListener = null
      state.propertyIdForListener = ''
    }

    state.jobNotes = []
  },
  /*  ----------------------
      Flush Order State
      ---------------------- */

  flush_state(state) {
    if (state.orderListener) {
      state.orderListener()
    }

    state.inspectionsSubtasksListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    state.allowablesSubtasksListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    state.workToDosSubtasksListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    state.jobTaskListeners.forEach((unsuscribe) => {
      unsuscribe()
    })
    if (state.jobNotesListener) {
      state.jobNotesListener()
    }
    state.order = {}
    state.inspections = []
    state.inspectionsSubtasksListeners = []
    state.allowables = []
    state.allowablesPools = []
    state.allowablesSubtasksListeners = []
    state.workToDos = []
    state.workToDosSubtasksListeners = []
    state.tools = []
    state.appointments = []
    state.instructions = []
    state.jobTaskListeners = []
    state.orderListener = null
    state.jobNotes = []
    state.jobNotesListener = null
    state.orderIdForListener = ''
    state.showJobNotesDrawer = false
    state.showPropertyHistoryDrawer = false
    state.jobTasksTemplates = {
      tools: [],
      workToDos: [],
      inspections: [],
      orderCategory: [],
      jobNoteType: [],
      inspectionsOptions: [],
    }
    state.jobTasksTemplatesInState = {
      tools: [],
      workToDos: [],
      inspections: [],
      orderCategory: [],
      jobNoteType: [],
      inspectionsOptions: [],
      appointments: [],
      instructions: [],
      itemsForInvoices: [],
      units: [],
      subAreas: [],
      orders: [],
    }
  },
}
