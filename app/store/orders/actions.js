import { get_orders } from './actions/get_orders'
import { add_order } from './actions/add_order'
import { woNumberNotExists } from './actions/woNumberNotExists'
import { add_ordersBatch } from './actions/add_ordersBatch'
import { set_archive_order } from './actions/set_archive_order'
import { set_onHold_order } from './actions/set_onHold_order'
import { assign_orders } from './actions/assign_orders'
import { unassign_orders } from './actions/unassign_orders'
import { get_order_by_id } from './actions/get_order_by_id'
import { get_orders_assigned } from './actions/get_orders_assigned'
import { set_priority_order } from './actions/set_priority_order'

export default {
  get_orders,
  add_order,
  add_ordersBatch,
  set_archive_order,
  set_onHold_order,
  assign_orders,
  unassign_orders,
  woNumberNotExists,
  get_order_by_id,
  get_orders_assigned,
  set_priority_order,
}
