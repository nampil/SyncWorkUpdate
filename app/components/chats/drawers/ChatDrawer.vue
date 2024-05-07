<template>
  <v-navigation-drawer
    v-model="showChatDrawer"
    absolute
    width="300"
    class="elevation-0"
  >
    <v-toolbar dense class="elevation-0">
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            color="primary"
            :ripple="false"
            class="d-flex"
            @click="handleSearch"
          >
            <v-icon v-bind="attrs" v-on="on">{{
              openSearch ? 'mdi-close ' : 'mdi-magnify'
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{ !openSearch ? $t('search') : $t('close') }}</span>
      </v-tooltip>
      <div :class="['search-box d-flex', { open: openSearch }]">
        <v-slide-x-transition>
          <v-text-field
            v-show="openSearch"
            id="searchInput"
            ref="searchInput"
            v-model="search"
            class="search-input ma-0"
            dense
            outlined
            :placeholder="$t('search')"
            hide-details="auto"
          ></v-text-field>
        </v-slide-x-transition>
      </div>
    </v-toolbar>
    <v-divider></v-divider>
    <div class="h-100 overflow-hidden d-flex flex-column">
      <div v-if="loadingNewChatGroup" class="text-center loading">
        <v-progress-linear indeterminate color="cyan"></v-progress-linear>
      </div>

      <div class="chat-drawer | pb-8 chat-drawer-comp">
        <v-list nav>
          <v-list-item
            v-for="(room, i) in chatRoomsFormatted"
            :key="i"
            :class="[
              'chat-list-item',
              {
                active:
                  roomSelectedFormatted && room.id === roomSelectedFormatted.id,
              },
            ]"
            link
            @click="handleSelectRoom(room)"
          >
            <v-list-item-avatar>
              <v-avatar
                v-if="room.isGroup"
                size="35px"
                color="primary"
                class="avatar-group"
              >
                <img
                  v-if="room.roomImg && room.roomImg.url"
                  :src="room.roomImg.url"
                  style="object-fit: cover"
                />
                <span v-else class="white--text text-h8">{{
                  room?.name?.slice(0, 2).toUpperCase() ?? ''
                }}</span>
              </v-avatar>
              <v-avatar v-else size="35px" color="primary" class="avatar-group">
                <img
                  v-if="room.subscribers[0].avatar"
                  style="object-fit: cover"
                  :src="room.subscribers[0].avatar.url"
                />
                <div v-else>
                  <span
                    v-if="room.subscribers[0].fullName"
                    class="white--text text-h8"
                    >{{
                      room.subscribers[0].name[0] +
                      room.subscribers[0].lastName[0]
                    }}</span
                  >
                </div>
              </v-avatar>
            </v-list-item-avatar>

            <v-list-item-content class="content-text">
              <v-list-item-title
                class="chat-item-title"
                v-text="room.isGroup ? room.name : room.subscribers[0].fullName"
              ></v-list-item-title>

              <p
                v-if="room.lastChat"
                class="metadata_last-chat mb-1 info--text"
              >
                {{ room.subtitle.lastChatUserName }}:
                {{ $truncate(room.subtitle.lastChatText, 15) }}
                {{ room.subtitle.lastChatAttachment }}
              </p>

              <p
                v-if="room.updatedAt"
                class="metadata_time mb-0 font-weight-light info--text text-right"
              >
                {{ room.updatedAt }}
              </p>
            </v-list-item-content>
            <div v-if="unreadChatsCountIndividual(room.id)">
              <v-badge
                :value="2"
                color="primary"
                :content="unreadChatsCountIndividual(room.id)"
                bottom
                overlap
                :offset-x="22"
                :offset-y="30"
              ></v-badge>
            </div>
          </v-list-item>
        </v-list>
      </div>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="add ma-1"
            fab
            small
            color="primary"
            @click.stop="drawerNewChat = !drawerNewChat"
            ><v-icon small v-bind="attrs" v-on="on"> mdi-plus </v-icon></v-btn
          >
        </template>
        <span>{{ $t('addChatRoom') }}</span>
      </v-tooltip>
    </div>
    <chat-drawer-new-chat-room />
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex'
import ChatDrawerNewChatRoom from './ChatDrawerNewChatRoom.vue'

export default {
  name: 'ChatDrawer',
  components: { ChatDrawerNewChatRoom },
  data() {
    return {
      openSearch: false,
      search: '',
      loadingNewChatGroup: false,
      group: null,
    }
  },
  computed: {
    showChatDrawer: {
      get() {
        return this.$store.state.chats.showChatDrawer
      },
      set(val) {
        this.$store.commit('chats/set_showChatDrawer', val)
      },
    },
    drawerNewChat: {
      get() {
        return this.$store.state.chats.drawerNewChat
      },
      set(val) {
        this.$store.commit('chats/set_drawerNewChat', val)
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
    ...mapState({
      user: (state) => state.auth.user,
      chatRooms: (state) => state.chats.chatRooms,
      users: (state) => state.chats.users,
    }),

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

        chats: _roomSelected.chats
          .map((c) => c)
          .sort((a, b) => {
            return a.createdAt.getTime() > b.createdAt.getTime() ? 1 : -1
          }),
      }
    },
    chatRoomsFormatted() {
      const _chatRooms = this.chatRooms
        .map((chatRoom) => {
          const contraparte = (property) => {
            const contraparte = chatRoom.subscribers[0]

            if (typeof contraparte === 'string' && this.usersList.length) {
              const contraparteProfile = this.usersList.filter(
                (user) => user.uid === contraparte
              )[0]

              return property
                ? contraparteProfile[property]
                : contraparteProfile
            }

            return property && contraparte[property]
              ? contraparte[property]
              : contraparte
          }

          let lastChat = null

          /* if (chatRoom.chats[chatRoom.chats.length - 1]) {
            const _lastChat = {
              ...chatRoom.chats[chatRoom.chats.length - 1], 
            } */

          if (chatRoom.chats[chatRoom.chats.length - 1]) {
            const ultimoMensaje =
              chatRoom.chats[chatRoom.chats.length - 1].createdAt >
              chatRoom.chats[0].createdAt
                ? chatRoom.chats[chatRoom.chats.length - 1]
                : chatRoom.chats[0]
            const _lastChat = {
              ...ultimoMensaje,
            }

            lastChat = {
              ..._lastChat,
              attachment:
                _lastChat.attachmentFiles &&
                _lastChat.attachmentFiles.length > 0,
              sendBy:
                _lastChat.sendBy !== this.user.profile.uid
                  ? this.users.filter((sub) => {
                      return sub.uid === _lastChat.sendBy
                    })[0]
                  : this.user.profile,
            }
          }

          const updatedAt = lastChat ? lastChat.createdAt : chatRoom.createdAt
          const updatedAtTimestamp = lastChat
            ? this.$formatDate(lastChat.createdAt, {
                timestamp: true,
              })
            : this.$formatDate(chatRoom.createdAt, {
                timestamp: true,
              })

          return {
            ...chatRoom,
            ...(chatRoom.isOrderChat && { name: `WO#${chatRoom.name}` }),
            ...(!chatRoom.isGroup && {
              name: contraparte('fullName'),
            }),
            ...(chatRoom.isOrderChat && {
              name: `WO#: ${chatRoom.name}`,
            }),
            updatedAt: this.$formatDate(updatedAt, { relativeToNow: true }),
            updatedAtTimestamp,
            lastChat,

            subtitle: {
              lastChatUserName:
                lastChat && lastChat.sendBy
                  ? lastChat.sendBy.uid === this.user.profile.uid
                    ? 'You'
                    : lastChat.sendBy.name
                  : '',
              lastChatText: lastChat ? lastChat.text : '',
              lastChatAttachment:
                lastChat && lastChat.attachment ? 'Atachment' : '',
            },
          }
        })
        .filter((room) => {
          return typeof room.active === 'undefined' || room.active
        })
        .sort((a, b) => {
          const aTimestamp = a.updatedAtTimestamp
          const bTimestamp = b.updatedAtTimestamp

          return aTimestamp > bTimestamp ? -1 : 1
          /* if(a.chats.length === 0){
            
            return 1
          }
          if(b.chats.length === 0){
            
            return -1
          }
          const lastChatA = a.chats[a.chats.length - 1].createdAt > a.chats[0].createdAt ? a.chats[a.chats.length - 1] : a.chats[0]
          const lastChatB = b.chats[b.chats.length - 1].createdAt > b.chats[0].createdAt ? b.chats[b.chats.length - 1] : b.chats[0]
          return lastChatA.createdAt > lastChatB.createdAt ? -1 : 1 */
        })

      const filterKey = this.search && this.search.toLowerCase()
      let data = _chatRooms

      if (filterKey) {
        data = data.filter(function (row) {
          row = row.isGroup
            ? { name: row.name }
            : { name: row.subscribers[0].fullName }
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().includes(filterKey)
          })
        })
      }
      return data
    },
  },
  watch: {
    group() {
      this.drawerNewChat = false
    },
    chatRooms(val) {
      if (!this.roomSelected && val.length) {
        this.roomSelected = val[0]
      }
    },
    showChatDrawer() {
      this.search = ''
      this.openSearch = false
    },
  },
  methods: {
    handleSearch() {
      this.openSearch = !this.openSearch
      this.$nextTick(() => {
        if (this.openSearch) {
          this.$refs.searchInput.focus()
        } else {
          this.$refs.searchInput.blur()
          this.search = ''
        }
      })
    },
    handleSelectRoom(room) {
      // this.showChatDrawer = false
      this.roomSelected = room.id
      this.search = ''
      this.openSearch = false
    },
    unreadChatsCountIndividual(roomId) {
      return this.$store.getters['chats/unreadChatsCountIndividual'](roomId)
    },
  },
}
</script>

<style lang="scss" scoped>
.search-box {
  max-width: 0;
  position: relative;
  transition: max-width 150ms ease-in;
  .search-input {
    width: 220px;
  }
  &.open {
    transition: max-width 150ms ease-in;
    max-width: 500px;
  }
}
.avatar-group {
  font-size: 15px;
}
.add {
  position: absolute;
  bottom: 5px;
  right: 15px;
}
.chat-drawer {
  overflow-y: auto;
}
.metadata_last-chat {
  font-size: 0.9rem;
}
.metadata_time {
  font-size: 0.75rem;
}
.active {
  background-color: var(--v-terciary-base);
  .chat-item-title {
    color: var(--v-primary-base);
  }
}

// ::v-deep .v-navigation-drawer__content,
// .chat-drawer {
//   -ms-overflow-style: none; /* IE and Edge */
//   scrollbar-width: none; /* Firefox */
// }
// ::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
// .chat-drawer::-webkit-scrollbar {
//   display: none; /* Chrome */
// }
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
