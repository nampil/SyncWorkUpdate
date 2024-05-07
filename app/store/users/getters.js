export default {
  usersIds: (state) => {
    return state.users.map((user) => user.uid)
  },
  getUserById: (state) => (userId) => {
    return state.users.find((user) => user.uid === userId)
  },
}
