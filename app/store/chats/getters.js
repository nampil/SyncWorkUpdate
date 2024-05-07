import { auth } from '~/plugins/firebase'

export default {
  unreadChatsCount(state) {
    const user = auth.currentUser
    const chatList = state.chatRooms.map(chatRoom => chatRoom.chats).flat(1)
    const chatListUnread = chatList.map(chat => chat.readBy).filter(readBy => !readBy.includes(user.uid))

    return chatListUnread.length
  },

  unreadChatsCountIndividual: (state) => (roomId) => {
    const user = auth.currentUser
    const chatRoom = state.chatRooms.filter(chatRoom => chatRoom.id === roomId)[0]
    const chatListUnread = chatRoom.chats.filter(chat => !chat.readBy.includes(user.uid))
    if (chatListUnread.length > 9) {
      return '9+'
    }
    return chatListUnread.length
  },
  isChatInState: (state) => (roomId) => {
    const indexOfChat = state.chatRooms.findIndex(chatRoom => chatRoom.id === roomId)

    return indexOfChat > -1
  }
}