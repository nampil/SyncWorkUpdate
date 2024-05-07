export default {
  add_user(state, userProfile) {
    const idx = state.users.findIndex((user) => user.uid === userProfile.uid)
    if (idx >= 0) {
      state.users.splice(idx, 1, userProfile)
      return
    }
    state.users.push(userProfile)
  },
  // update_user(state, userProfile) {
  //   const idx = state.users.findIndex((user) => user.id === userProfile.id)
  //   if (idx >= 0) {
  //     state.users.splice(idx, 1, userProfile)
  //   }
  // },
  // delete_user(state, userProfile) {
  //   const idx = state.users.findIndex((user) => user.id === userProfile.id)
  //   if (idx >= 0) {
  //     state.users.splice(idx, 1)
  //   }
  // },

  set_userUidSelected(state, userUid) {
    state.userUidSelected = userUid
  },
  set_showUserInfo(state, payload) {
    state.showUserInfo = payload
  },
}
