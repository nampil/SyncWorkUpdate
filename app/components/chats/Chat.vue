<template>
  <transition name="slide-left">
    <div
      v-show="showChats"
      :class="[
        'chats elevation-1',
        { 'd-grid': showChats, 'drawer-open': showChatDrawer },
      ]"
    >
      <!-- Chat Drawer -->
      <div class="drawer-wrapper">
        <chat-drawer ref="drawer" />
      </div>
      <div class="chats-inner-wrapper">
        <v-toolbar color="secondary" dark dense class="elevation-0 flex-grow-0">
          <v-app-bar-nav-icon
            class="mr-4"
            @click="showChatDrawer = !showChatDrawer"
          ></v-app-bar-nav-icon>

          <v-avatar
            v-if="
              roomSelectedFormatted !== null && roomSelectedFormatted.isGroup
            "
            size="35px"
            color="accent"
            class="avatar-toolbar"
          >
            <img
              v-if="
                typeof roomSelectedFormatted.roomImg !== null &&
                roomSelectedFormatted.roomImg !== 'undefined' &&
                JSON.stringify(roomSelectedFormatted.roomImg) !== '{}' &&
                roomSelectedFormatted.roomImg &&
                roomSelectedFormatted.roomImg.url !== '' &&
                roomSelectedFormatted.roomImg.url !== null
              "
              :src="roomSelectedFormatted.roomImg.url"
              style="object-fit: cover"
            />
            <span v-else class="info--text text-h8">{{
              roomSelectedFormatted?.name?.slice(0, 2).toUpperCase() ?? ''
            }}</span>
          </v-avatar>
          <v-avatar
            v-else-if="
              roomSelectedFormatted !== null && !roomSelectedFormatted.isGroup
            "
            size="35px"
            color="accent"
            class="avatar-toolbar"
          >
            <img
              v-if="roomSelectedFormatted.subscribers[0].avatar"
              style="object-fit: cover"
              :src="roomSelectedFormatted.subscribers[0].avatar.url"
            />
            <div v-else>
              <span
                v-if="
                  typeof roomSelectedFormatted.subscribers[0].fullName !==
                  'undefined'
                "
                class="info--text text-h8"
                >{{
                  roomSelectedFormatted.subscribers[0].name[0] +
                  roomSelectedFormatted.subscribers[0].lastName[0]
                }}</span
              >
            </div>
          </v-avatar>

          <v-toolbar-title
            v-if="
              roomSelectedFormatted !== null && roomSelectedFormatted.isGroup
            "
          >
            {{ roomSelectedFormatted?.name ?? '' }}
          </v-toolbar-title>
          <v-toolbar-title v-else>
            <span
              v-if="
                roomSelectedFormatted !== null &&
                roomSelectedFormatted.subscribers.length
              "
            >
              {{ roomSelectedFormatted.subscribers[0].fullName }}
            </span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- Chat Options -->
          <chat-options />

          <v-btn class="mr-2" icon small @click="handelShowChats(false)">
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="chats-content">
          <div
            v-if="roomSelectedFormatted"
            id="scroll-zone"
            ref="chatZone"
            class="chat-zone | flex-grow-1"
          >
            <span v-if="loading">Loading</span>
            <div
              v-if="
                roomSelectedFormatted &&
                roomSelectedFormatted.chats.length &&
                roomSelectedFormatted.hasMoreChats
              "
              class="load-more-container text-center"
            >
              <v-tooltip open-delay="600" content-class="small" bottom>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="elevation-0 mt-1"
                    icon
                    color="blue "
                    :loading="loadingMoreChats"
                    v-bind="attrs"
                    v-on="on"
                    @click="handleLoadMoreChats($event)"
                    ><v-icon>mdi-plus</v-icon></v-btn
                  >
                </template>
                <span>{{ $t('showMessages') }}</span>
              </v-tooltip>
            </div>
            <chat-message
              v-for="msg in roomSelectedFormatted.chats"
              :id="msg.id"
              :key="msg.id"
              :ref="msg.id"
              :msg="msg"
              :subscribers="
                roomSelectedFormatted.subscribers.map((sub) => sub.uid)
              "
              class="chat-message"
              @scroll-chat="handleScrollChat"
            />
          </div>
        </div>
        <div>
          <v-divider class="mx-0"></v-divider>
          <chat-form
            :loading="sendingMsg"
            :reset-form="resetChatForm"
            @form-resetted="resetChatForm = false"
            @send-message="handleSendMsg"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { serverTimestamp } from 'firebase/firestore'
import { mapState } from 'vuex'
import ChatForm from './ChatForm.vue'
import ChatMessage from './ChatMessageView.vue'
import ChatDrawer from './drawers/ChatDrawer.vue'
import ChatOptions from './ChatOptions.vue'

import { auth } from '@/plugins/firebase'

export default {
  name: 'Chat',
  components: { ChatForm, ChatMessage, ChatDrawer, ChatOptions },
  data() {
    return {
      loading: false,
      loadingMoreChats: false,
      loadingContractor: false,
      resetChatForm: false,
      messageSend: {},
      sendingMsg: false,
      observer: null,
      noAutoScroll: false,
    }
  },
  computed: {
    chatToGo: {
      get() {
        return this.$store.state.chats.chatToGo
      },
      set(val) {
        this.$store.commit('chats/set_chatToGo', val)
      },
    },
    showChatDrawer: {
      get() {
        return this.$store.state.chats.showChatDrawer
      },
      set(val) {
        this.$store.commit('chats/set_showChatDrawer', val)
      },
    },
    roomSelected: {
      get() {
        return this.$store.state.chats.roomSelected
      },
      set(val) {
        this.$store.commit('chats/set_roomSelected', val)
      },
    },
    showChatOption: {
      get() {
        return this.$store.state.chats.showChatOption
      },
      set(val) {
        this.$store.commit('chats/set_showChatOption', val)
      },
    },
    ...mapState({
      chatRooms: (state) => state.chats.chatRooms,
      showChats: (state) => state.chats.showChats,
      user: (state) => state.auth.user,
    }),
    scrollChatZone: {
      get() {
        return this.$store.state.chats.scrollChatZone
      },
      set(payload) {
        this.$store.commit('chats/set_scrollChatZone', payload)
      },
    },
    roomSelectedFormatted() {
      if (!this.roomSelected) {
        return null
      }

      const indexOfRoomSelected = this.chatRooms.findIndex(
        (chatRoom) => chatRoom.id === this.roomSelected
      )

      const _roomSelected = this.chatRooms[indexOfRoomSelected]

      if (!_roomSelected) {
        return null
      }

      return {
        ..._roomSelected,
        ...(_roomSelected.isOrderChat && { name: `WO#${_roomSelected.name}` }),
        chats: _roomSelected.chats
          .map((c) => c)
          .sort((a, b) => {
            return a.createdAt.getTime() > b.createdAt.getTime() ? 1 : -1
          }),
      }
    },
  },
  watch: {
    $route: {
      handler(newVal) {
        if (newVal.query.showChat) {
          this.roomSelected = newVal.query.crid
          this.chatToGo = newVal.query.msg
          this.$store.commit('chats/toggleShowChats')
        }
      },
      immediate: true,
    },
    chatRooms(val) {
      if (!this.roomSelected && val.length) {
        this.roomSelected = val[0].id
      }
    },
    async roomSelected(newRoom, oldRoom) {
      if (newRoom && !newRoom.firstChatsLoad) {
        await this.getChatsForChatRoom(newRoom.id)
      }

      this.$nextTick(() => {
        this.handleScrollChat()
        this.addChatElementToObserver()
      })
    },
    roomSelectedFormatted: {
      handler(newRoom, oldRoom) {
        if (newRoom && newRoom.chats && newRoom.chats.length && this.chatToGo) {
          this.hightLightChat(this.chatToGo)
        }

        if (oldRoom && newRoom && newRoom.chats.length > oldRoom.chats.length) {
          this.$nextTick(() => {
            const chatsTimestamp = newRoom.chats.map((chat) => chat.timestamp)

            const indexOfLastChat = newRoom.chats.findIndex(
              (chat) => chat.timestamp === Math.max(...chatsTimestamp)
            )

            const lastChatId = newRoom.chats[indexOfLastChat].id
            const lastChatEl = document.getElementById(lastChatId)

            if (lastChatEl) {
              this.observer.observe(lastChatEl)
            }
          })
        }
      },
      deep: true,
    },
    scrollChatZone(val) {
      if (val) {
        this.handleScrollChat()
      }
    },
    showChats(newVal, oldVal) {
      if (newVal) {
        this.addChatElementToObserver()
      }
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(this.handleRead)
  },
  methods: {
    hightLightChat(msgId) {
      if (this.$refs[msgId] && this.$refs[msgId][0]) {
        this.chatToGo = ''

        const target = this.$refs[msgId][0].$el
        target.classList.add('hightlight')

        this.handleScrollChat(msgId, true)

        setTimeout(() => {
          target.classList.remove('hightlight')
          this.noAutoScroll = false
        }, 5000)
      }
    },
    addChatElementToObserver() {
      this.$nextTick(() => {
        const elementChats = document.querySelectorAll('.chat-message')

        if (elementChats && elementChats.length) {
          elementChats.forEach((element) => {
            this.observer.observe(element)
          })
        }
      })
    },
    handleRead(entries) {
      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index]

        if (entry.isIntersecting) {
          const indexOfChat = this.roomSelectedFormatted.chats.findIndex(
            (chat) => chat.id === entry.target.id
          )

          if (
            !this.roomSelectedFormatted.chats[indexOfChat].readBy.includes(
              this.user.profile.uid
            )
          ) {
            try {
              this.$store.dispatch('chats/set_readBy', {
                chatRoomId: this.roomSelected,
                chatId: entry.target.id,
              })
            } catch (error) {
              // eslint-disable-next-line
              console.log('error updating chat', error)
            }
          } else {
            this.observer.unobserve(entry.target)
          }
        }
      }
    },
    async handleLoadMoreChats(e) {
      const chatZone = this.$refs.chatZone

      try {
        this.loadingMoreChats = true
        const scrollHeightBefore = chatZone.scrollHeight
        const room = this.chatRooms.filter(
          (room) => room.id === this.roomSelected
        )[0]

        const chatsTimestamp = room.chats.map((chat) => chat.timestamp)

        const indexOfLastChat = room.chats.findIndex(
          (chat) => chat.timestamp === Math.min(...chatsTimestamp)
        )

        const lastChatLoaded = room.chats[indexOfLastChat]
        await this.$store.dispatch('chats/get_moreChatsByChatRoom', {
          chatRoomId: this.roomSelected,
          lastChatLoaded,
        })

        const scrollHeightAfter = chatZone.scrollHeight
        const newScrollPsotition = scrollHeightAfter - scrollHeightBefore

        chatZone.scroll({
          top: newScrollPsotition,
        })
        this.loadingMoreChats = false
      } catch (error) {
        this.loadingMoreChats = false
      }
    },
    async getChatsForChatRoom(chatRoomId, lastChatLoaded) {
      try {
        this.loading = true

        await this.$store.dispatch('chats/get_chatsByChatRoom', {
          chatRoomId,
          lastChatLoaded,
        })
        this.loading = false
        if (this.chatToGo) {
          this.hightLightChat(this.chatToGo)
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error geting chats', error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handelShowChats(showChats) {
      this.$store.commit('chats/toggleShowChats', showChats)
    },
    handleScrollChat(target, holdScroll) {
      if (this.noAutoScroll) {
        return
      }
      const chatZone = this.$refs.chatZone
      if (!chatZone) {
        return
      }
      let positioToScroll = chatZone.scrollHeight
      this.$nextTick(() => {
        if (this.$refs[target] && this.$refs[target][0]) {
          const elToScrollTo = this.$refs[target][0].$el

          positioToScroll = elToScrollTo.offsetTop - 100
        }
        chatZone.scroll({
          top: positioToScroll,
          behavior: 'smooth',
        })
      })

      this.scrollChatZone = false
      if (holdScroll) {
        this.noAutoScroll = true
      }
    },
    async getRooms() {
      try {
        this.loading = true

        const userId = auth.currentUser.uid
        await this.$store.dispatch('get_rooms', { userId })

        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async handleSendMsg({ msg, attachmentFiles, taggedUsers }) {
      this.sendingMsg = true
      const subscribersIds = this.roomSelectedFormatted.subscribers.map(
        (sub) => sub.uid
      )
      const sendMessage = {
        text: msg,
        sendBy: this.user.profile.uid,
        createdAt: serverTimestamp(),
        roomId: this.roomSelected,
        readBy: [this.user.profile.uid],
        deliveredTo: [this.user.profile.uid],
        taggedUsers,
        subscribers: subscribersIds,
      }
      try {
        await this.$store.dispatch('chats/add_chatByChatRoon', {
          sendMessage,
          attachmentFiles,
        })
        this.resetChatForm = true
        this.sendingMsg = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.sendingMsg = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.chats {
  position: absolute;
  bottom: 39px;
  right: 1rem;
  min-height: 50vh;
  height: 60%;
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  background-color: var(--clr-bg-alt);
  z-index: 5;

  &.d-grid {
    display: grid;
    grid-template-columns: 0 1fr;
    transition: all 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    &.drawer-open {
      grid-template-columns: 300px 1fr;
    }
  }
}
.chats-inner-wrapper {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.chats-content {
  position: relative;
}

.chat-zone {
  position: absolute;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
// ::v-deep .v-navigation-drawer__content,
// .chat-zone {
//   -ms-overflow-style: none; /* IE and Edge */
//   scrollbar-width: none; /* Firefox */
// }
// ::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
// .chat-zone::-webkit-scrollbar {
//   display: none; /* Chrome */
// }
// ::v-deep .v-navigation-drawer__content {
//   display: flex;
//   flex-direction: column;
//   overflow: hidden;
// }
.load-more-container {
  position: relative;
  margin-inline: auto;
  width: 50px;
}
.load-more-container::after,
.load-more-container::before {
  content: '';
  position: absolute;
  height: 1px;
  width: 100vmax;
  background-color: #ddd;
}
.load-more-container::after {
  right: 100%;
  top: 50%;
}
.load-more-container::before {
  left: 100%;
  top: 50%;
}
.avatar-toolbar {
  margin: 0 10px 0 0;
  font-size: 15px;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter,
.slide-left-leave-to {
  transform: translateX(110%);
}
</style>
