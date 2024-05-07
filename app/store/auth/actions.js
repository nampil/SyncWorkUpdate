import { handleAuth } from './actions/handleAuth'
import { handle_permissionForPushNotifications } from './actions/handle_permissionForPushNotifications'
import { handle_logout } from './actions/handle_logout'
import { handle_messagingPermission } from './actions/handle_messagingPermission'
import { sendNotificationToken } from './actions/sendNotificationToken'
import { update_notification } from './actions/update_notification'
import { set_notificationRead } from './actions/set_notificationRead'
import { set_notificationResponded } from './actions/set_notificationResponded'
import { delete_notification } from './actions/delete_notification'
import { get_notifications } from './actions/get_notifications'
import { get_userData } from './actions/get_userData'
import { get_preferences } from './actions/get_preferences'
import { update_profile } from './actions/update_profile'
import { update_password } from './actions/update_password'
import { update_pic_for_profile } from './actions/update_pic_for_profile'
import { set_profileLanguage } from './actions/set_profileLanguage'
import { get_usersProfile } from './actions/get_usersProfile'

export default {
  handleAuth,
  handle_permissionForPushNotifications,
  handle_logout,
  handle_messagingPermission,
  sendNotificationToken,
  update_notification,
  set_notificationRead,
  set_notificationResponded,
  delete_notification,
  get_notifications,
  get_userData,
  get_preferences,
  update_profile,
  update_password,
  update_pic_for_profile,
  set_profileLanguage,
  get_usersProfile,
}
