// Api Http

const { addNewUser } = require('./api/http/addNewUser')
const { assignOrder } = require('./api/http/assignOrder')
const { unassignOrder } = require('./api/http/unassignOrder')
const { getUsersList } = require('./api/http/getUsersList')
const { deleteUser } = require('./api/http/deleteUser')
const { updateUser } = require('./api/http/updateUser')
const {
  sendnotificationtouser,
} = require('./api/http/send-notification-to-user')
const { addToOrderHistory } = require('./api/http/addToOrderHistory')
const { deleteDoc } = require('./api/http/deleteDoc')
const { updateDoc } = require('./api/http/updateDoc')
const { getSupervisorsList } = require('./api/http/getSupervisorsList')
const {
  sendNotificationToSupervisor,
} = require('./api/http/sendNotificationToSupervisor')
const { copyReports } = require('./api/http/copyReports')

const { remindernotification } = require('./api/http/reminder-notification')

// Api Firestores

const { workToDosOnWrite } = require('./api/firestore/orders/workToDosOnWrite')
const {
  inspectionsOnWrite,
} = require('./api/firestore/orders/inspectionsOnWrite')
const { ordersOnWrite } = require('./api/firestore/orders/ordersOnWrite')

const { routeOnWrite } = require('./api/firestore/routes/routeOnWrite')
const { paymentsOnWrite } = require('./api/firestore/orders/paymentsOnWrite')
const { invoiceOnWrite } = require('./api/firestore/orders/invoiceOnWrite')
const { jobNotesOnWrite } = require('./api/firestore/orders/jobNotesOnWrite')
const { toolsOnWrite } = require('./api/firestore/orders/toolsOnWrite')
const {
  requirementsOnDelete,
} = require('./api/firestore/requirements/requirementsOnDelete')

const {
  appointmentsOnWrite,
} = require('./api/firestore/orders/appointmentsOnWrite')
const {
  allowablesOnWrite,
} = require('./api/firestore/orders/allowablesOnWrite')
const {
  allowablesPoolsOnWrite,
} = require('./api/firestore/orders/allowablesPoolsOnWrite')

const {
  chatsOnCreate,
} = require('./api/firestore/chatRooms/chats/chatsOnCreate')

const { ratingsOnWritte } = require('./api/firestore/ratings/ratingsOnWritte')

const { copyFiles } = require('./api/http/copyFiles')

const { cleanRoutes } = require('./api/http/services/cleanRoutes')
const { saveReportInfo } = require('./api/storage/saveReportInfo')

const {
  itemsForInvoiceTemplatesOnWrite,
} = require('./api/firestore/admin/config/itemsForInvoiceTemplatesOnWrite')

const {
  workToDosTemplatesOnUpdate,
} = require('./api/firestore/admin/config/workToDosTemplatesOnUpdate')
const { copyMoveReports } = require('./api/http/copyMoveReports')

exports.addNewUser = addNewUser
exports.unassignOrder = unassignOrder
exports.assignOrder = assignOrder
exports.inspectionsOnWrite = inspectionsOnWrite
exports.workToDosOnWrite = workToDosOnWrite
exports.allowablesOnWrite = allowablesOnWrite
exports.allowablesPoolsOnWrite = allowablesPoolsOnWrite
exports.appointmentsOnWrite = appointmentsOnWrite
exports.toolsOnWrite = toolsOnWrite
exports.sendnotificationtouser = sendnotificationtouser
exports.chatsOnCreate = chatsOnCreate
exports.jobNotesOnWrite = jobNotesOnWrite
exports.invoiceOnWrite = invoiceOnWrite
exports.paymentsOnWrite = paymentsOnWrite
exports.routeOnWrite = routeOnWrite
exports.ordersOnWrite = ordersOnWrite
exports.addToOrderHistory = addToOrderHistory
exports.updateUser = updateUser
exports.deleteUser = deleteUser
exports.getUsersList = getUsersList
exports.deleteDoc = deleteDoc
exports.updateDoc = updateDoc
exports.sendNotificationToSupervisor = sendNotificationToSupervisor
exports.getSupervisorsList = getSupervisorsList
exports.copyReports = copyReports
exports.remindernotification = remindernotification
exports.ratingsOnWritte = ratingsOnWritte
exports.copyFiles = copyFiles
exports.requirementsOnDelete = requirementsOnDelete
exports.cleanRoutes = cleanRoutes
exports.saveReportInfo = saveReportInfo
exports.itemsForInvoiceTemplatesOnWrite = itemsForInvoiceTemplatesOnWrite
exports.workToDosTemplatesOnUpdate = workToDosTemplatesOnUpdate
exports.copyMoveReports = copyMoveReports
