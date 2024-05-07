import { updatePassword } from 'firebase/auth'
import { auth } from '~/plugins/firebase'

export async function update_password(_, newUserPass) {
  await updatePassword(auth.currentUser, newUserPass)
}
