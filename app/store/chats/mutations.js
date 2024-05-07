import { auth } from '~/plugins/firebase'

export default {
  set_chatToGo(state, payload) {
    state.chatToGo = payload
  },
  set_scrollChatZone(state, payload) {
    state.scrollChatZone = payload
  },
  toggleShowChats(state, payload) {
    if (typeof payload !== 'undefined') {
      state.showChats = payload
      return
    }

    state.showChats = !state.showChats
  },

  add_chatRoom(state, chatRoom) {
    state.chatRooms.unshift(chatRoom)
  },
  delete_chatRoom(state, chatRoomId) {
    const isSelected = state.roomSelected.id === chatRoomId

    const index = state.chatRooms.findIndex((cr) => cr.id === chatRoomId)
    state.chatRooms.splice(index, 1)

    if (isSelected) {
      state.roomSelected = state.chatRooms[0]
    }
  },
  update_chatRoom(state, chatRoomModified) {
    const index = state.chatRooms.findIndex(
      (cr) => cr.id === chatRoomModified.id
    )
    const chatRoomInState = state.chatRooms[index]
    const updatedChatRoom = {
      ...chatRoomInState,
      ...chatRoomModified,
    }
    state.chatRooms.splice(index, 1, updatedChatRoom)
  },

  set_chatListener(state, { chatRoomId, chatListener }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      state.chatRooms[indexOfRoom].chatListener = chatListener
    }
  },
  set_lastChatLoaded(state, { chatRoomId, lastVisible }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      state.chatRooms[indexOfRoom].lastChatLoaded = lastVisible
    }
  },

  add_chatToRoom(state, { chatRoomId, chat }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      const _chat = state.chatRooms[indexOfRoom].chats.map((cr) => cr)

      _chat.push(chat)

      state.chatRooms[indexOfRoom].chats = _chat
    }
  },
  update_chatToRoom(state, { chatRoomId, chat }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      const indexOfChat = state.chatRooms[indexOfRoom].chats.findIndex(
        (ch) => ch.id === chat.id
      )

      if (indexOfChat > -1) {
        state.chatRooms[indexOfRoom].chats.splice(indexOfChat, 1, chat)
      }
    }
  },
  delete_chatToRoom(state, { chatRoomId, chat }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      const indexOfChat = state.chatRooms[indexOfRoom].chats.findIndex(
        (ch) => ch.id === chat.id
      )

      if (indexOfChat > -1) {
        state.chatRooms[indexOfRoom].chats.splice(indexOfChat, 1)
      }
    }
  },

  set_userProfileInChatRoom(state, { chatRoomId, userProfile }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    const indexOfUserId = state.chatRooms[indexOfRoom].subscribers.findIndex(
      (subscriber) => subscriber === userProfile.uid
    )
    state.chatRooms[indexOfRoom].subscribers.splice(
      indexOfUserId,
      1,
      userProfile
    )
  },
  set_firstChatsLoad(state, { chatRoomId, value }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      state.chatRooms[indexOfRoom].firstChatsLoad = value
    }
  },

  set_hasMoreChats(state, { chatRoomId, value }) {
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )

    if (indexOfRoom > -1) {
      state.chatRooms[indexOfRoom].hasMoreChats = value
    }
  },
  set_showChatDrawer(state, payload) {
    state.showChatDrawer = payload
  },

  set_roomSelected(state, payload) {
    state.roomSelected = payload
  },
  set_drawerNewChat(state, payload) {
    state.drawerNewChat = payload
  },
  set_drawerNewChatGroup(state, payload) {
    state.drawerNewChatGroup = payload
  },
  set_chatRoomsListener(state, payload) {
    state.chatRoomsListener = payload
  },
  set_showChatOption(state, payload) {
    state.showChatOption = payload
  },
  clear_chatRooms(state) {
    state.chatRooms.forEach((chatRoom) => {
      if (chatRoom.chatListener) {
        chatRoom.chatListener()
      }
    })
    state.chatRooms = []
    if (state.chatRoomsListener) {
      state.chatRoomsListener()
      state.chatRoomsListener = null
    }
  },
  set_allUsers(state, users) {
    state.users = users
  },
  update_chat_readBy(state, { chatRoomId, chatId }) {
    const user = auth.currentUser
    const indexOfRoom = state.chatRooms.findIndex(
      (chatRoom) => chatRoom.id === chatRoomId
    )
    if (indexOfRoom > -1) {
      const indexOfChat = state.chatRooms[indexOfRoom].chats.findIndex(
        (chat) => chat.id === chatId
      )
      if (indexOfChat > -1) {
        if (
          !state.chatRooms[indexOfRoom].chats[indexOfChat].readBy.includes(
            user.uid
          )
        ) {
          state.chatRooms[indexOfRoom].chats[indexOfChat].readBy.push(user.uid)
        }
      }
    }
  },

  flush_state(state) {
    state.chatRooms.forEach((chatRoom) => {
      if (chatRoom.chatListener) {
        chatRoom.chatListener()
      }
    })
    state.chatRooms = []
    state.showChats = false
    state.scrollChatZone = false
    state.roomSelected = null
    state.showChatDrawer = false
    state.drawerNewChat = false
    state.drawerNewChatGroup = false
    if (state.chatRoomsListener) {
      state.chatRoomsListener()
      state.chatRoomsListener = null
    }
  },
}
