// import { auth } from '~/plugins/firebase'

export default ({ redirect, route, store }) => {
  const userClaims = store.state.auth.user.userCredential.claims

  if (!userClaims) {
    const goTo = route.fullPath

    window.localStorage.setItem('goTo', goTo)

    return redirect('/login')
  }
}
