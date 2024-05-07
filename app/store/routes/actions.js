import { get_routes } from './actions/get_routes'
import { save_routes } from './actions/save_routes'
import { update_route } from './actions/update_route'
import { upload_files_for_routes } from './actions/upload_files_for_routes'
import { delete_file_for_route } from './actions/delete_file_for_route'
import { delete_route } from './actions/delete_route'
import { set_marker } from './actions/set_marker'
import { toggle_bounce } from './actions/toggle_bounce'

export default {
  get_routes,
  save_routes,
  update_route,
  upload_files_for_routes,
  delete_file_for_route,
  delete_route,
  set_marker,
  toggle_bounce,
}
