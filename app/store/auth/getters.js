export default {
  isAuth(state) {
    return !!state.user.userCredential.uid
  },
  isHighLevelAuth(state) {
    const authLevel = state.user.userCredential?.claims?.authLevel

    if (authLevel && parseFloat(authLevel) >= 10) {
      return true
    }
    return false
  },
}
