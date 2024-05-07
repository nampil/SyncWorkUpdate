import { get_order } from './actions/get_order'
import { get_JobTasks } from './actions/get_JobTasks'
import { add_jobTask } from './actions/add_jobTask'
import { update_jobTask } from './actions/update_jobTask'
import { update_jobTasks } from './actions/update_jobTasks'
import { update_materialsOrTools } from './actions/update_materialsOrTools'
import { update_requirements } from './actions/update_requirements'
import { upload_pic_for_requirements } from './actions/upload_pic_for_requirements'
import { delete_pic_for_task } from './actions/delete_pic_for_task'
import { remove_pic_for_requirement } from './actions/remove_pic_for_requirement'
import { upload_pic_for_tasks } from './actions/upload_pic_for_tasks'
import { remove_jobTask } from './actions/remove_jobTask'
import { update_jobTaskInspections } from './actions/update_jobTaskInspections'
import { remove_jobTaskInspections } from './actions/remove_jobTaskInspections'
import { get_jobTasksMaterialsOrTools } from './actions/get_jobTasksMaterialsOrTools'
import { get_jobTasksRequirements } from './actions/get_jobTasksRequirements'
import { update_order } from './actions/update_order'
import { upload_foh_picture } from './actions/upload_foh_picture'
import { delete_foh_picture } from './actions/delete_foh_picture'
import { get_jobNotes_for_order } from './actions/get_jobNotes_for_order'
import { get_userNoteTo } from './actions/get_userNoteTo'
import { add_jobNote } from './actions/add_jobNote'
import { upload_pic_for_job } from './actions/upload_pic_for_job'
import { remove_jobNote } from './actions/remove_jobNote'
import { remove_pic_for_job } from './actions/remove_pic_for_job'
import { update_jobNote } from './actions/update_jobNote'
import { update_pinJobNote } from './actions/update_pinJobNote'
import { get_invoiceData } from './actions/get_invoiceData'
import { add_invoice } from './actions/add_invoice'
import { get_payments } from './actions/get_payments'
import { add_payment } from './actions/add_payment'
import { update_payment } from './actions/update_payment'
import { delete_payment } from './actions/delete_payment'
import { get_ordersByPropertyId } from './actions/get_ordersByPropertyId'
import { get_jobTasksByOrdersProperty } from './actions/get_jobTasksByOrdersProperty'
import { get_requirementsByjobTasks } from './actions/get_requirementsByjobTasks'
import { get_materialsOrToolsByjobTasks } from './actions/get_materialsOrToolsByjobTasks'
import { get_templatesForOrder } from './actions/get_templatesForOrder'
import { get_task_templates } from './actions/get_task_templates'
import { get_reportsCount } from './actions/get_reportsCount'
import { get_JobTaskReports } from './actions/get_JobTaskReports'
import { get_reportsForTask } from './actions/get_reportsForTask'
import { get_orderReports } from './actions/get_orderReports'
import { get_reportsForSection } from './actions/get_reportsForSection'
import { get_reportsForDawnload } from './actions/get_reportsForDawnload'
import { get_reports_order_info } from './actions/get_reports_order_info'
import { add_areasAndReports } from './actions/add_areasAndReports'
import { get_imgBlob } from './actions/get_imgBlob'
import { handleReopenOrder } from './actions/handleReopenOrder'
import { copy_files_service } from './actions/copy_files_service'
import { get_ordersTemplates } from './actions/get_ordersTemplates'
import { add_jobTasks } from './actions/add_jobTasks'
import { add_bid } from './actions/add_bid'
import { get_bids } from './actions/get_bids'
import { update_bid } from './actions/update_bid'
import { get_reportsBid } from './actions/get_reportsBid'
import { delete_bid } from './actions/delete_bid'
import { add_winterization } from './actions/add_winterization'
import { get_bidsProperty } from './actions/get_bidsProperty'
import { update_report } from './actions/update_report'
import { get_workTemplateId } from './actions/get_workTemplateId'
import { get_reportsBids } from './actions/get_reportsBids'
import { update_reports } from './actions/update_reports'

export default {
  get_order,
  get_JobTasks,
  add_jobTask,
  update_jobTask,
  update_jobTasks,
  update_materialsOrTools,
  update_requirements,
  upload_pic_for_requirements,
  delete_pic_for_task,
  remove_pic_for_requirement,
  upload_pic_for_tasks,
  remove_jobTask,
  update_jobTaskInspections,
  remove_jobTaskInspections,
  get_jobTasksMaterialsOrTools,
  get_jobTasksRequirements,
  update_order,
  upload_foh_picture,
  delete_foh_picture,
  get_jobNotes_for_order,
  get_userNoteTo,
  add_jobNote,
  upload_pic_for_job,
  remove_jobNote,
  remove_pic_for_job,
  update_jobNote,
  update_pinJobNote,
  get_invoiceData,
  add_invoice,
  get_payments,
  add_payment,
  update_payment,
  delete_payment,
  get_ordersByPropertyId,
  get_jobTasksByOrdersProperty,
  get_requirementsByjobTasks,
  get_materialsOrToolsByjobTasks,
  get_templatesForOrder,
  get_task_templates,
  get_reportsCount,
  get_JobTaskReports,
  get_reportsForTask,
  get_orderReports,
  get_reportsForSection,
  get_reportsForDawnload,
  get_reports_order_info,
  add_areasAndReports,
  get_imgBlob,
  handleReopenOrder,
  copy_files_service,
  get_ordersTemplates,
  add_jobTasks,
  add_bid,
  get_bids,
  update_bid,
  get_reportsBid,
  delete_bid,
  add_winterization,
  get_bidsProperty,
  update_report,
  get_workTemplateId,
  get_reportsBids,
  update_reports,

  /*  ----------------------
      Flush Order State
      ---------------------- */
  flush_state({ commit }) {
    commit('detach_listeners')
    commit('flush_state')
  },
}
