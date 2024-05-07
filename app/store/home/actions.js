import { get_allOrders } from './actions/get_allOrders.js'
import { get_orderProperties } from './actions/get_orderProperties.js'
import { get_ordersFilters } from './actions/get_ordersFilters.js'
import { set_ordersFilters } from './actions/set_ordersFilters.js'
import { update_ordersFilters } from './actions/update_ordersFilters.js'
import { set_headersTable } from './actions/set_headersTable.js'

export default {
  get_allOrders,
  get_ordersFilters,
  get_orderProperties,
  set_ordersFilters,
  update_ordersFilters,
  set_headersTable,
}
