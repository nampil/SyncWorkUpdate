import { get_route_for_day_date } from './actions/get_route_for_day_date'
import { save_routes } from './actions/save_routes'
import { delete_routes } from './actions/delete_routes'
import { update_orders } from './actions/update_orders'
import { handle_user_as_supervisor } from './actions/handle_user_as_supervisor'
import { get_routesUpdates } from './actions/get_routesUpdates'
import { send_routeUpdate } from './actions/send_routeUpdate'
import { get_requirements_for_route } from './actions/get_requirements_for_route'
import { set_routeArrived } from './actions/set_routeArrived'
import { set_routeCancelled } from './actions/set_routeCancelled'
import { remove_oos_supervisor } from './actions/remove_oos_supervisor'

export default {
  get_route_for_day_date,
  get_requirements_for_route,
  save_routes,
  delete_routes,
  update_orders,
  handle_user_as_supervisor,
  get_routesUpdates,
  send_routeUpdate,
  set_routeArrived,
  set_routeCancelled,
  remove_oos_supervisor,
}
