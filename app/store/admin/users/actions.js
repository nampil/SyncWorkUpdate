import { add_new_user } from './actions/add_new_user'
import { get_users } from './actions/get_users'
import { get_userById } from './actions/get_userById'
import { update_user } from './actions/update_user'
import { sendMessage } from './actions/sendMessage'
import { update_pic_for_profile } from './actions/update_pic_for_profile'
import { update_pic_for_documents } from './actions/update_pic_for_documents'
import { get_datesAdmin } from './actions/get_datesAdmin'
import { remove_pic_for_user_documents } from './actions/remove_pic_for_user_documents'
import { remove_pic_for_avatar } from './actions/remove_pic_for_avatar'
export default {
  add_new_user,
  get_users,
  get_userById,
  update_user,
  sendMessage,
  update_pic_for_profile,
  update_pic_for_documents,
  get_datesAdmin,
  remove_pic_for_user_documents,
  remove_pic_for_avatar,
}
