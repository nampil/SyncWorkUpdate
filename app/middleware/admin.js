import { ROL_TYPES } from '~/utils/dictionaries'
import { auth } from '~/plugins/firebase'

export default ({ store, redirect }) => {
  auth.currentUser
    .getIdTokenResult()
    .then(({ claims }) => {
      const { authLevel, rol } = claims

      const isAdmin = rol === ROL_TYPES.admin
      if (isAdmin && parseInt(authLevel) < 7) {
        return redirect('/')
      }
    })
    .catch((error) => {
      // eslint-disable-next-line
      console.log('error', error)

      return redirect('/')
    })
}
