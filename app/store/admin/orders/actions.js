import { add_orderCategory_templates } from './actions/add_orderCategory_templates'
import { update_orderCategory_template } from './actions/update_orderCategory_template'
import { add_jobNoteType_templates } from './actions/add_jobNoteType_templates'
import { update_jobNoteType_template } from './actions/update_jobNoteType_template'
import { add_task_templates } from './actions/add_task_templates'
import { update_task_template } from './actions/update_task_template'
import { delete_task_template } from './actions/delete_task_template'
import { upload_pic_for_tasks_template } from './actions/upload_pic_for_tasks_template'
import { remove_pic_for_task_template } from './actions/remove_pic_for_task_template'
import { upload_pic_for_task_template } from './actions/upload_pic_for_task_template'
import { add_task_template_requirements } from './actions/add_task_template_requirements'
import { copyPictures } from './actions/copyPictures'
import { update_task_template_requirements } from './actions/update_task_template_requirements'
import { delete_task_template_requirements } from './actions/delete_task_template_requirements'
import { get_tasks_templates } from './actions/get_tasks_templates'
import { get_tasks_templates_active } from './actions/get_tasks_templates_active'
import { get_templatesItemsInvoicesForClient } from './actions/get_templatesItemsInvoicesForClient'
import { get_requirementsForTemplate } from './actions/get_requirementsForTemplate'
import { remove_pic_for_requirement } from './actions/remove_pic_for_requirement'
import { upload_pic_for_requirements } from './actions/upload_pic_for_requirements'
import { get_materialsOrToolsForTemplate } from './actions/get_materialsOrToolsForTemplate'
import { add_task_template_materialsOrTools } from './actions/add_task_template_materialsOrTools'
import { delete_task_template_materialsOrTools } from './actions/delete_task_template_materialsOrTools'
import { get_clients } from './actions/get_clients'
import { add_client_templates } from './actions/add_client_templates'
import { update_client_template } from './actions/update_client_template'
import { delete_client_template } from './actions/delete_client_template'
import { get_departments } from './actions/get_departments'
import { add_department_templates } from './actions/add_department_templates'
import { update_department_template } from './actions/update_department_template'
import { delete_department_template } from './actions/delete_department_template'
import { get_ordersTemplates } from './actions/get_ordersTemplates'
import { get_taskOrdersTemplates } from './actions/get_taskOrdersTemplates'
import { add_order_templates } from './actions/add_order_templates'
import { update_order_template } from './actions/update_order_template'
import { update_task } from './actions/update_task'
import { delete_task } from './actions/delete_task'
import { delete_order_template } from './actions/delete_order_template'
import { upload_pic_for_order_tasks } from './actions/upload_pic_for_order_tasks'
import { upload_pic_for_order_task_requirements } from './actions/upload_pic_for_order_task_requirements'
import { delete_pic_for_task } from './actions/delete_pic_for_task'
import { delete_pic_for_requirements } from './actions/delete_pic_for_requirements'
import { update_materialsOrToolsInOrdersTemplates } from './actions/update_materialsOrToolsInOrdersTemplates'
import { update_requirementsInOrdersTemplates } from './actions/update_requirementsInOrdersTemplates'
import { get_templatesForLoanTypes } from './actions/get_templatesForLoanTypes'

export default {
  add_orderCategory_templates,
  update_orderCategory_template,
  add_jobNoteType_templates,
  update_jobNoteType_template,
  add_task_templates,
  update_task_template,
  delete_task_template,
  upload_pic_for_tasks_template,
  remove_pic_for_task_template,
  upload_pic_for_task_template,
  add_task_template_requirements,
  copyPictures,
  update_task_template_requirements,
  delete_task_template_requirements,
  get_tasks_templates,
  get_tasks_templates_active,
  get_templatesItemsInvoicesForClient,
  get_requirementsForTemplate,
  remove_pic_for_requirement,
  upload_pic_for_requirements,
  get_materialsOrToolsForTemplate,
  add_task_template_materialsOrTools,
  delete_task_template_materialsOrTools,
  get_clients,
  add_client_templates,
  update_client_template,
  delete_client_template,
  get_departments,
  add_department_templates,
  update_department_template,
  delete_department_template,
  get_ordersTemplates,
  get_taskOrdersTemplates,
  add_order_templates,
  update_order_template,
  update_task,
  delete_task,
  delete_order_template,
  upload_pic_for_order_tasks,
  upload_pic_for_order_task_requirements,
  delete_pic_for_task,
  delete_pic_for_requirements,
  update_materialsOrToolsInOrdersTemplates,
  update_requirementsInOrdersTemplates,
  get_templatesForLoanTypes,
}
