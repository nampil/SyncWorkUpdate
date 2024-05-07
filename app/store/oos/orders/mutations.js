// import _ from 'lodash'

export default {
  add_order_listener(state, { listener, orderId }) {
    if (Array.isArray(orderId)) {
      orderId.forEach((id) => {
        state.orderListeners.push({ listener, orderId: id })
      })
      return
    }
    state.orderListeners.push({ listener, orderId })
  },

  set_order(state, { order, selectedOrderId }) {
    const indexOfOrder = state.orders.map((o) => o.id).indexOf(order.id)
    if (indexOfOrder > -1) {
      const orderUpdated = {
        ...state.orders[indexOfOrder],
        ...order,
      }

      state.orders.splice(indexOfOrder, 1, orderUpdated)
      return
    }
    const newOrder = {
      ...order,
      appointments: [],
      inspections: [],
      allowables: [],
      allowablesPools: [],
      workToDos: [],
      notification: false,
    }
    state.orders.push(newOrder)
  },
  update_orders(state, orders) {
    state.orders = [...orders, ...state.orders]
  },
  remove_order(state, orderId) {
    const indexOfOrder = state.orders.map((o) => o.id).indexOf(orderId)

    if (indexOfOrder > -1) {
      state.orders.splice(indexOfOrder, 1)
    }
    const requirementListeners = state.taskRequirementListeners.filter(
      (trl) => trl.orderId === orderId
    )
    if (requirementListeners.length) {
      requirementListeners.forEach((trl) => trl.unsubscribe())
      state.taskRequirementListeners = state.taskRequirementListeners.filter(
        (trl) => trl.orderId !== orderId
      )
    }

    const materialsOrToolsListeners =
      state.taskMaterialsOrToolsListeners.filter(
        (trl) => trl.orderId === orderId
      )
    if (materialsOrToolsListeners.length) {
      materialsOrToolsListeners.forEach((trl) => trl.unsubscribe())
      state.taskMaterialsOrToolsListeners =
        state.taskMaterialsOrToolsListeners.filter(
          (trl) => trl.orderId !== orderId
        )
    }
    const taskChatUnsubscribe = state.taskChatUnsubscribe.filter(
      (tcl) => tcl.orderId === orderId
    )
    if (taskChatUnsubscribe.length) {
      taskChatUnsubscribe.forEach((tcl) => tcl.unsubscribe())
      state.taskChatUnsubscribe = state.taskChatUnsubscribe.filter(
        (tcl) => tcl.orderId !== orderId
      )
    }
  },

  /* Notificaciones de orders */
  hide_notification_order_by_id(state, orderId) {
    const indexOfOrder = state.orders.map((o) => o.id).indexOf(orderId)
    if (indexOfOrder > -1) {
      state.orders[indexOfOrder].notification = false
    }
  },
  show_notification_order_by_id(state, { orderId, selectedOrderId }) {
    const indexOfOrder = state.orders.map((o) => o.id).indexOf(orderId)

    if (indexOfOrder > -1) {
      const notification =
        this.$router.currentRoute.fullPath !== '/cdp' ||
        selectedOrderId !== orderId
      state.orders[indexOfOrder].notification = notification
      if (notification) {
        state.playNotification = true
      }
    }
  },
  set_showOrderNotification(state, payload) {
    state.showOrderNotification = payload
  },
  update_playNotification(state, payload) {
    state.playNotification = payload
  },

  set_statusOrder(state, { orderId, status }) {
    state.statusOrders[orderId] = status
  },

  flush_orders_in_route(state, { routeId }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)
    const orders = state.routes[indexOfRoute].orders.map((order) => {
      if (typeof order !== 'string') {
        return order.id
      }
      return order
    })
    state.routes[indexOfRoute].orders = orders
    if (state.routes[indexOfRoute].orderListeners.length) {
      state.routes[indexOfRoute].orderListeners.forEach((listener) =>
        listener()
      )
      state.routes[indexOfRoute].orderListeners = []
    }
  },
  /* Task */
  add_job_task(state, { doc, type, orderId, routeId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    state.orders[indexOfOrder][type].push(doc)
  },
  update_job_task(state, { doc, type, orderId, routeId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    const indexToUpdate = state.orders[indexOfOrder][type]
      .map((jt) => jt.id)
      .indexOf(doc.id)

    const _jobTask = state.orders[indexOfOrder][type][indexToUpdate]

    const oldTask = JSON.parse(JSON.stringify(_jobTask))

    const notification = handleTaskNotificationOnTaskUpdated({
      oldTask,
      newTask: doc,
      routeId,
      type,
    })
    if (notification) {
      state.orders[indexOfOrder].notifications.push(notification)
    }

    // const jobTaskUpdated = _.merge(_jobTask, doc)
    const jobTaskUpdated = { ..._jobTask, ...doc }
    state.orders[indexOfOrder][type].splice(indexToUpdate, 1, jobTaskUpdated)
  },

  remove_job_task(state, { docId, type, orderId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    const indexToUpdate = state.orders[indexOfOrder][type]
      .map((jt) => jt.id)
      .indexOf(docId)
    state.orders[indexOfOrder][type].splice(indexToUpdate, 1)
  },

  remove_notification(state, { orderId, notiId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder > -1) {
      const order = state.orders[indexOfOrder]
      const indexOfNoti = order.notifications.findIndex(
        (noti) => noti.id === notiId
      )
      if (indexOfNoti === 0) {
        state.showOrderNotification = null
      }
      if (indexOfNoti > -1) {
        order.notifications.splice(indexOfNoti, 1)
      }
    }
  },

  add_jobTaskListeners(state, { orderId, listeners }) {
    state.jobTaskListeners.push({ orderId, listeners })
  },
  flush_jobTaskListeners_for_orders(state, { orders }) {
    orders.forEach((orderId) => {
      const jobTaskListeners = state.jobTaskListeners.filter(
        (jobTaskListener) => jobTaskListener.orderId === orderId
      )
      jobTaskListeners.forEach((jobTaskListener) => {
        jobTaskListener.listeners.forEach((l) => l())
      })
      state.jobTaskListeners = state.jobTaskListeners.filter(
        (jobTaskListener) => jobTaskListener.orderId !== orderId
      )
    })
  },

  /* Report */
  add_task_report(
    state,
    { doc, type, orderId, taskId, routeId, taskSelected, taskTitle }
  ) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    state.orders[indexOfOrder][type][indexOfTask].reports.push(doc)
  },

  update_task_report(state, { doc, type, orderId, taskId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder === -1) return
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask === -1) return
    const indexOfReport = state.orders[indexOfOrder][type][
      indexOfTask
    ].reports.findIndex((report) => report.id === doc.id)

    if (indexOfReport > -1) {
      state.orders[indexOfOrder][type][indexOfTask].reports.splice(
        indexOfReport,
        1,
        doc
      )
    }
  },
  remove_task_report(state, { docId, type, orderId, taskId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder === -1) return
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask === -1) return
    const indexOfReport = state.orders[indexOfOrder][type][
      indexOfTask
    ].reports.findIndex((report) => report.id === docId)

    if (indexOfReport > -1) {
      state.orders[indexOfOrder][type][indexOfTask].reports.splice(
        indexOfReport,
        1
      )
    }
  },

  add_jobTaskReportsListeners(state, payload) {
    state.taskReportListeners.push(payload)
  },

  /* Requirements */
  add_task_requirements(state, { doc, type, orderId, taskId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder < 0) {
      return
    }

    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask < 0) {
      return
    }
    if (state.orders[indexOfOrder][type][indexOfTask].requirements) {
      state.orders[indexOfOrder][type][indexOfTask].requirements.push(doc)
    }
  },

  update_task_requirements(
    state,
    { doc, type, orderId, taskId, routeId, taskSelected }
  ) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder === -1) return
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask === -1) return
    const indexOfRequirement = state.orders[indexOfOrder][type][
      indexOfTask
    ].requirements.findIndex((requirement) => requirement.id === doc.id)

    if (indexOfRequirement > -1) {
      const oldReq =
        state.orders[indexOfOrder][type][indexOfTask].requirements[
          indexOfRequirement
        ]

      const currentRoutePath = this.$router.currentRoute.fullPath
      let notification = null

      if (
        !currentRoutePath.includes('task') ||
        (currentRoutePath.includes('task') && taskSelected.taskId !== taskId)
      ) {
        notification = handleTaskNotificationOnTaskRequirementUpdated({
          oldReq,
          newReq: doc,
          taskId,
          routeId,
          type,
        })
      }

      if (notification) {
        state.orders[indexOfOrder].notifications.push(notification)
      }

      state.orders[indexOfOrder][type][indexOfTask].requirements.splice(
        indexOfRequirement,
        1,
        doc
      )
    }
  },
  remove_task_requirements(state, { docId, type, orderId, taskId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder === -1) return
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask === -1) return
    const indexOfRequirement = state.orders[indexOfOrder][type][
      indexOfTask
    ].requirements.findIndex((requirement) => requirement.id === docId)

    if (indexOfRequirement > -1) {
      state.orders[indexOfOrder][type][indexOfTask].requirements.splice(
        indexOfRequirement,
        1
      )
    }
  },

  add_jobTaskRequirementsListeners(state, payload) {
    state.taskRequirementListeners.push(payload)
  },

  /* Materials Or Tools */
  add_task_materialsOrTools(state, { doc, type, orderId, taskId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder < 0) {
      return
    }

    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask < 0) {
      return
    }
    if (state.orders[indexOfOrder][type][indexOfTask].materialsOrTools) {
      state.orders[indexOfOrder][type][indexOfTask].materialsOrTools.push(doc)
    }
  },
  update_task_materialsOrTools(
    state,
    { doc, type, orderId, taskId, routeId, taskSelected }
  ) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder === -1) return
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask === -1) return
    const indexOfMaterial = state.orders[indexOfOrder][type][
      indexOfTask
    ].materialsOrTools.findIndex((m) => m.id === doc.id)

    if (indexOfMaterial > -1) {
      state.orders[indexOfOrder][type][indexOfTask].materialsOrTools.splice(
        indexOfMaterial,
        1,
        doc
      )
    }
  },
  remove_task_materialsOrTools(state, { docId, type, orderId, taskId }) {
    const indexOfOrder = state.orders.findIndex((order) => order.id === orderId)
    if (indexOfOrder === -1) return
    const indexOfTask = state.orders[indexOfOrder][type].findIndex(
      (task) => task.id === taskId
    )
    if (indexOfTask === -1) return
    const indexOfMaterial = state.orders[indexOfOrder][type][
      indexOfTask
    ].materialsOrTools.findIndex((m) => m.id === docId)

    if (indexOfMaterial > -1) {
      state.orders[indexOfOrder][type][indexOfTask].materialsOrTools.splice(
        indexOfMaterial,
        1
      )
    }
  },
  add_jobTaskMaterialsOrToolsListeners(state, payload) {
    state.taskMaterialsOrToolsListeners.push(payload)
  },
  set_showJobNotesDrawerOos(state, payload) {
    state.showJobNotesDrawerOos = payload
  },
  set_showPropertyHistoryDrawerOos(state, payload) {
    state.showPropertyHistoryDrawerOos = payload
  },
  set_showTaskInfoDrawer(state, payload) {
    state.showTaskInfoDrawer = payload
  },
  set_showTaskChats(state, payload) {
    state.showTaskChats = payload
  },
  set_openEditOrder(state, payload) {
    state.openEditOrder = payload
  },
  set_taskSelected(state, payload) {
    state.taskSelected = payload
  },

  // Task Chats

  set_taskChatUnsubscribe(state, payload) {
    state.taskChatUnsubscribe.push(payload)
  },
  set_showTask(state, payload) {
    state.showTask = payload
  },

  add_taskChat(
    state,
    { chat, orderId, type, task, taskSelected, routeId, isFirstLoad }
  ) {
    const indexOfOrder = state.orders.findIndex((o) => o.id === orderId)
    if (indexOfOrder === -1) {
      return
    }
    const order = state.orders[indexOfOrder]
    const indexOfTask = order[type].findIndex((t) => t.id === task.id)
    if (indexOfTask === -1) {
      return
    }

    const currentRoutePath = this.$router.currentRoute.fullPath
    let notification = null

    if (
      !isFirstLoad &&
      (!currentRoutePath.includes('task') ||
        (currentRoutePath.includes('task') &&
          taskSelected &&
          taskSelected.taskId !== task.id))
    ) {
      notification = handleTaskNotificationOnTextReport({
        newTextReport: chat,
        taskId: task.id,
        routeId,
        type,
        taskTitle: task.title,
      })
    }

    if (notification) {
      state.orders[indexOfOrder].notifications.push(notification)
    }

    order[type][indexOfTask].taskChats.unshift(chat)
  },
  update_taskChat(state, { chat, orderId, type, taskId }) {
    const indexOfOrder = state.orders.findIndex((o) => o.id === orderId)
    if (indexOfOrder === -1) {
      return
    }
    const order = state.orders[indexOfOrder]
    const indexOfTask = order[type].findIndex((t) => t.id === taskId)
    if (indexOfTask === -1) {
      return
    }
    const task = order[type][indexOfTask]
    const indexOfChat = task.taskChats.findIndex(
      (oldchat) => oldchat.id === chat.id
    )
    if (indexOfChat === -1) {
      return
    }
    const oldchat = task.taskChats[indexOfChat]
    const newChat = {
      ...oldchat,
      ...chat,
      ...(chat.readBy && { readBy: [...chat.readBy] }),
    }
    task.taskChats.splice(indexOfChat, 1, newChat)
  },
  remove_taskChat(state, { chat, orderId, type, taskId }) {
    const indexOfOrder = state.orders.findIndex((o) => o.id === orderId)
    if (indexOfOrder === -1) {
      return
    }
    const order = state.orders[indexOfOrder]
    const indexOfTask = order[type].findIndex((t) => t.id === taskId)
    if (indexOfTask === -1) {
      return
    }
    const task = order[type][indexOfTask]
    const indexOfChat = task.taskChats.findIndex(
      (oldchat) => oldchat.id === chat.id
    )
    if (indexOfChat === -1) {
      return
    }

    task.taskChats.splice(indexOfChat, 1)
  },

  set_hightlightTaskChat(state, payload) {
    state.hightlightTaskChat = payload
  },
  set_scrollChatZone(state, payload) {
    state.scrollChatZone = payload
  },

  // Statuses Orders
  add_statusOrder(state, { orderId, status }) {
    const newState = { ...state.statusOrders }
    if (!newState[orderId]?.length) {
      newState[orderId] = []
    }
    newState[orderId].unshift(status)
    state.statusOrders = newState
  },
  update_statusOrder(state, { orderId, status }) {
    const indexOfStatus = state.statusOrders[orderId].findIndex(
      (s) => s.id === status.id
    )
    if (indexOfStatus === -1) {
      return
    }
    state.statusOrders[orderId].splice(indexOfStatus, 1, status)
  },
  remove_statusOrder(state, { orderId, status }) {
    const indexOfStatus = state.statusOrders[orderId].findIndex(
      (s) => s.id === status.id
    )
    if (indexOfStatus === -1) {
      return
    }
    state.statusOrders[orderId].splice(indexOfStatus, 1)
  },
  set_statusOrderUnsubscribe(state, payload) {
    state.statusOrderUnsubscribe = payload
  },

  // Reports Selected
  set_reportsSelected(state, { orderId, type, taskId, reportsSelected }) {
    const task = getTaskSelected({ state, orderId, type, taskId })

    task.reportsSelected = reportsSelected
  },
  add_reportSelected(state, report) {
    const { orderId, task } = report
    const { type, id: taskId } = task

    const _task = getTaskSelected({ state, orderId, type, taskId })
    _task.reportsSelected.push(report)
  },

  remove_reportSelected(state, report) {
    const { orderId, task } = report
    const { type, id: taskId } = task
    const _task = getTaskSelected({ state, orderId, type, taskId })

    const indexToDelete = _task.reportsSelected.findIndex(
      (r) => r.id === report.id
    )
    if (indexToDelete === -1) {
      return
    }

    _task.reportsSelected.splice(indexToDelete, 1)
  },

  // Requirements
  add_requirement(state, { requirement, orderId, taskId, taskType }) {
    const indexOfReqList = state.requirementsListMap.findIndex(
      (rl) =>
        rl.orderId === orderId &&
        rl.taskId === taskId &&
        rl.taskType === taskType
    )
    if (indexOfReqList === -1) {
      state.requirementsListMap.push({
        orderId,
        taskId,
        taskType,
        requirements: [requirement],
      })
      return
    }

    const requirements = JSON.parse(
      JSON.stringify(state.requirementsListMap[indexOfReqList].requirements)
    )
    const indexOfReq = requirements.findIndex((r) => r.id === requirement.id)
    if (indexOfReq > -1) {
      requirements.splice(indexOfReq, 1, requirement)
    } else {
      requirements.push(requirement)
    }
    state.requirementsListMap[indexOfReqList] = {
      orderId,
      taskId,
      taskType,
      requirements,
    }
    state.requirementsListMap.splice(indexOfReqList, 1, {
      orderId,
      taskId,
      taskType,
      requirements,
    })
  },
  update_requirement(state, { requirement, orderId, taskId, taskType }) {
    const indexOfReqList = state.requirementsListMap.findIndex(
      (rl) =>
        rl.orderId === orderId &&
        rl.taskId === taskId &&
        rl.taskType === taskType
    )
    if (indexOfReqList === -1) {
      return
    }
    const requirements = JSON.parse(
      JSON.stringify(state.requirementsListMap[indexOfReqList].requirements)
    )
    const indexOfReq = requirements.findIndex((r) => r.id === requirement.id)
    if (indexOfReq === -1) {
      return
    }
    requirements.splice(indexOfReq, 1, requirement)

    state.requirementsListMap.splice(indexOfReqList, 1, {
      orderId,
      taskId,
      taskType,
      requirements,
    })
  },
  delete_requirement(state, { requirement, orderId, taskId, taskType }) {
    const indexOfReqList = state.requirementsListMap.findIndex(
      (rl) =>
        rl.orderId === orderId &&
        rl.taskId === taskId &&
        rl.taskType === taskType
    )
    if (indexOfReqList === -1) {
      return
    }
    const requirements = JSON.parse(
      JSON.stringify(state.requirementsListMap[indexOfReqList].requirements)
    )
    const indexOfReq = requirements.findIndex((r) => r.id === requirement.id)
    if (indexOfReq === -1) {
      return
    }
    requirements.splice(indexOfReq, 1)
    state.requirementsListMap.splice(indexOfReqList, 1, {
      orderId,
      taskId,
      taskType,
      requirements,
    })
  },

  set_requirement_unsubscribe(
    state,
    { unsubscribe, orderId, taskId, taskType }
  ) {
    state.requirementsUnsuscribeMap[`${orderId}-${taskId}-${taskType}`] =
      unsubscribe
  },
  flush_task_requirements(state, { taskId, taskType, orderId }) {
    const indexOfListReqs = state.requirementsListMap.findIndex(
      (reqs) =>
        reqs.taskId === taskId &&
        reqs.taskType === taskType &&
        reqs.orderId === orderId
    )

    if (indexOfListReqs === -1) {
      return
    }
    state.requirementsListMap.splice(indexOfListReqs, 1)

    const unsubscribe =
      state.requirementsUnsuscribeMap[`${orderId}-${taskId}-${taskType}`]
    if (state.requirementsUnsuscribeMap[`${orderId}-${taskId}-${taskType}`]) {
      unsubscribe()
      state.requirementsUnsuscribeMap[`${orderId}-${taskId}-${taskType}`] = null
    }
  },
  flush_requirements_by_orderId(state, { orderId }) {
    const requirementsListMap = state.requirementsListMap.filter(
      (reqs) => reqs.orderId !== orderId
    )
    state.requirementsListMap = requirementsListMap
  },
  flush_requirement_by_taskId(state, { taskId }) {
    const requirementsListMap = state.requirementsListMap.filter(
      (reqs) => reqs.taskId !== taskId
    )
    state.requirementsListMap = requirementsListMap
  },

  // Flush

  flush_state(state) {
    state.orders = []
    state.reportsSelected = []

    for (let i = 0; i < state.orderListeners.length; i++) {
      const listener = state.orderListeners[i].listener
      listener()
    }
    state.orderListeners = []

    for (let i = 0; i < state.jobTaskListeners.length; i++) {
      const listeners = state.jobTaskListeners[i].listeners
      listeners.forEach((listener) => listener())
    }
    state.jobTaskListeners = []

    for (let i = 0; i < state.taskReportListeners.length; i++) {
      const listener = state.taskReportListeners[i].unsubscribe
      listener()
    }
    state.taskReportListeners = []

    for (let i = 0; i < state.taskRequirementListeners.length; i++) {
      const listener = state.taskRequirementListeners[i].unsubscribe
      listener()
    }

    for (let i = 0; i < state.taskMaterialsOrToolsListeners.length; i++) {
      const listener = state.taskMaterialsOrToolsListeners[i].unsubscribe
      listener()
    }

    for (let i = 0; i < state.statusOrderUnsubscribe.length; i++) {
      const listener = state.statusOrderUnsubscribe[i].unsubscribe
      listener()
    }

    if (state.taskChatUnsubscribe) {
      state.taskChatUnsubscribe()
      state.taskChatUnsubscribe = null
    }
    state.taskRequirementListeners = []
    state.taskMaterialsOrToolsListeners = []
    state.showJobNotesDrawerOos = false
    state.showPropertyHistoryDrawerOos = false
    state.taskSelected = null
    state.statusOrderUnsubscribe = []
  },
}

function getTaskSelected({ state, orderId, type, taskId }) {
  const indexOfOrder = state.orders.findIndex((o) => o.id === orderId)
  if (indexOfOrder === -1) {
    return
  }
  const order = state.orders[indexOfOrder]
  const taskType = order[type]

  const indexOfTask = taskType.findIndex((task) => task.id === taskId)
  if (indexOfTask === -1) {
    return
  }

  const task = taskType[indexOfTask]
  return task
}

function handleTaskNotificationOnTextReport({
  newTextReport,
  taskId,
  routeId,
  taskTitle,
  type,
}) {
  const id = '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)

  return {
    id,
    routeId,
    taskId,
    reportId: newTextReport.id,
    itemTitle: taskTitle,
    update: newTextReport.createdBy.name + ': ' + newTextReport.text,
    type,
  }
}
function handleTaskNotificationOnTaskRequirementUpdated({
  oldReq,
  newReq,
  taskId,
  routeId,
  type,
}) {
  const id = '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
  const reqId = newReq.id
  const reqDesc = newReq.descRequirement

  const contractorCompleted =
    (typeof oldReq.contractorCompleted === 'undefined' ||
      !oldReq.contractorCompleted) &&
    typeof newReq.contractorCompleted !== 'undefined' &&
    newReq.contractorCompleted

  if (!contractorCompleted) {
    return null
  }

  const updateTxtBase = 'Contractor completed'
  let updateTxtComplement = ''

  if (contractorCompleted) {
    updateTxtComplement = 'requirement'
  }

  return {
    id,
    routeId,
    taskId,
    reqId,
    itemTitle: reqDesc,
    update: `${updateTxtBase} ${updateTxtComplement}`,
    type,
  }
}

function handleTaskNotificationOnTaskUpdated({
  oldTask,
  newTask,
  routeId,
  type,
}) {
  const id = '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
  const taskId = newTask.id
  const taskTitle = newTask.title

  const updateTxtBase = 'Contractor completed'
  let updateTxtComplement = ''

  if (newTask.type === 'inspections' && newTask.contractorCompletedByArea) {
    let notificationCount = 0

    Object.keys(newTask.contractorCompletedByArea).forEach((area) => {
      if (
        (!oldTask.contractorCompletedByArea ||
          (oldTask.contractorCompletedByArea &&
            typeof oldTask.contractorCompletedByArea[area] === 'undefined') ||
          (oldTask.contractorCompletedByArea &&
            !oldTask.contractorCompletedByArea[area])) &&
        newTask.contractorCompletedByArea[area]
      ) {
        updateTxtComplement += area
        updateTxtComplement += !area.toLowerCase().includes('inspection')
          ? ' inspection'
          : ''

        notificationCount++
      }
    })

    if (notificationCount === 0) {
      return null
    }

    return {
      id,
      routeId,
      taskId,
      itemTitle: taskTitle,
      update: `${updateTxtBase} ${updateTxtComplement}`,
      type,
    }
  }

  const contractorCompleted =
    (typeof oldTask.contractorCompleted === 'undefined' ||
      !oldTask.contractorCompleted) &&
    typeof newTask.contractorCompleted !== 'undefined' &&
    newTask.contractorCompleted
  const contractorCompletedBefore =
    (typeof oldTask.contractorCompletedBefore === 'undefined' ||
      !oldTask.contractorCompletedBefore) &&
    typeof newTask.contractorCompletedBefore !== 'undefined' &&
    newTask.contractorCompletedBefore
  const contractorCompletedDuring =
    (typeof oldTask.contractorCompletedDuring === 'undefined' ||
      !oldTask.contractorCompletedDuring) &&
    typeof newTask.contractorCompletedDuring !== 'undefined' &&
    newTask.contractorCompletedDuring
  const contractorCompletedAfter =
    (typeof oldTask.contractorCompletedAfter === 'undefined' ||
      !oldTask.contractorCompletedAfter) &&
    typeof newTask.contractorCompletedAfter !== 'undefined' &&
    newTask.contractorCompletedAfter

  if (
    !contractorCompleted &&
    !contractorCompletedBefore &&
    !contractorCompletedDuring &&
    !contractorCompletedAfter
  ) {
    return null
  }

  if (contractorCompleted) {
    updateTxtComplement = 'task'
  } else if (contractorCompletedBefore) {
    updateTxtComplement = 'before'
  } else if (contractorCompletedDuring) {
    updateTxtComplement = 'during'
  } else if (contractorCompletedAfter) {
    updateTxtComplement = 'after'
  }

  return {
    id,
    routeId,
    taskId,
    itemTitle: taskTitle,
    update: `${updateTxtBase} ${updateTxtComplement}`,
    type,
  }
}
