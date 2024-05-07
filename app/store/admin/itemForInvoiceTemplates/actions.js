import { get_relativeItems } from './actions/get_relativeItems'
import { autocomplete_requirementOnWorkTemplate } from './actions/autocomplete_requirementOnWorkTemplate'
import { duplicate_requirement } from './actions/duplicate_requirement'
import { get_workTemplate } from './actions/get_workTemplate'
import { validate_workTemplate } from './actions/validate_workTemplate'
import { update_itemForInvoiceTemplate } from './actions/update_itemForInvoiceTemplate'
import { add_itemForInvoiceTemplate } from './actions/add_itemForInvoiceTemplate'
import { delete_itemForInvoiceTemplate } from './actions/delete_itemForInvoiceTemplate'

export default {
  get_relativeItems,
  autocomplete_requirementOnWorkTemplate,
  duplicate_requirement,
  get_workTemplate,
  validate_workTemplate,
  update_itemForInvoiceTemplate,
  add_itemForInvoiceTemplate,
  delete_itemForInvoiceTemplate,
}
