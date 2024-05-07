import { get_ordersByRouteId } from './actions/get_ordersByRouteId'
import { get_JobTasks } from './actions/get_JobTasks'
import { get_taskChats } from './actions/get_taskChats'
import { get_JobTasksReports } from './actions/get_JobTasksReports'
import { get_jobTasksRequirements } from './actions/get_jobTasksRequirements'
import { get_jobTasksMaterialsOrTools } from './actions/get_jobTasksMaterialsOrTools'
import { update_oosChecked } from './actions/update_oosChecked'
import { update_reportsApprovedForRequirement } from './actions/update_reportsApprovedForRequirement'
import { update_reportsApproved } from './actions/update_reportsApproved'
import { update_reportSetForReapply } from './actions/update_reportSetForReapply'
import { add_requirements } from './actions/add_requirements'
import { update_requirements } from './actions/update_requirements'
import { delete_requirements } from './actions/delete_requirements'
import { remove_pic_for_requirement } from './actions/remove_pic_for_requirement'
import { upload_pic_for_requirements } from './actions/upload_pic_for_requirements'
import { handleTaskStatus } from './actions/handleTaskStatus'
import { handleReportTextSave } from './actions/handleReportTextSave'
import { upload_file_for_chat } from './actions/upload_file_for_chat'
import { handleOrderStatus } from './actions/handleOrderStatus'
import { get_ordersByReportsActions } from './actions/get_ordersByReportsActions'
import { getJobTasksForOrderId } from './actions/getJobTasksForOrderId'
import { get_requirementsForTask } from './actions/get_requirementsForTask'
import { copy_reports } from './actions/copy_reports'
import { add_reports } from './actions/add_reports'
import { update_pic_for_report } from './actions/update_pic_for_report'
import { update_groupName } from './actions/update_groupName'
import { set_allowablePoolApproved } from './actions/set_allowablePoolApproved'
import { update_ect } from './actions/update_ect'
import { get_statusesOrders } from './actions/get_statusesOrders'
import { add_statusOrder } from './actions/add_statusOrder'
import { update_taskChat } from './actions/update_taskChat'

export default {
  get_ordersByRouteId,
  get_JobTasks,
  get_taskChats,
  get_JobTasksReports,
  get_jobTasksRequirements,
  get_jobTasksMaterialsOrTools,
  update_oosChecked,
  update_reportsApprovedForRequirement,
  update_reportsApproved,
  update_reportSetForReapply,
  add_requirements,
  update_requirements,
  delete_requirements,
  remove_pic_for_requirement,
  upload_pic_for_requirements,
  get_requirementsForTask,
  handleTaskStatus,
  handleReportTextSave,
  upload_file_for_chat,
  handleOrderStatus,
  get_ordersByReportsActions,
  getJobTasksForOrderId,
  copy_reports,
  add_reports,
  update_pic_for_report,
  update_groupName,
  set_allowablePoolApproved,
  update_ect,
  get_statusesOrders,
  add_statusOrder,
  update_taskChat,
}
