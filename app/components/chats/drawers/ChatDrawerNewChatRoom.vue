<template>
  <div class="mx-auto overflow-hidden">
    <!-- Chat Drawer, chat enter user -->
    <v-navigation-drawer v-model="drawerNewChat" absolute temporary width="300">
      <div v-if="loadingNewChatGroup" class="text-center loading">
        <v-progress-linear indeterminate color="cyan"></v-progress-linear>
      </div>
      <v-toolbar dense class="elevation-0">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop="drawerNewChat = !drawerNewChat"
              ><v-icon>mdi-arrow-left</v-icon></v-btn
            >
          </template>
          <span>{{ $t('back') }}</span>
        </v-tooltip>

        <v-spacer></v-spacer>

        <v-btn
          color="primary"
          small
          class="new-group-btn | elevation-0"
          @click.stop="drawerNewChatGroup = !drawerNewChatGroup"
        >
          <v-icon class="mr-3 mb-1">mdi-account-group</v-icon>
          <h4>{{ $t('newGroup') }}</h4>
        </v-btn>
        <v-spacer></v-spacer>
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
      </v-toolbar>

      <transition name="growDown">
        <v-text-field
          v-show="openSearch"
          ref="searchInput"
          v-model="search"
          class="search-input ma-2"
          dense
          autofocus
          outlined
          :placeholder="$t('search')"
          hide-details="auto"
        ></v-text-field>
      </transition>

      <v-divider></v-divider>
      <div class="users-list h-100">
        <v-list v-if="users.length" nav>
          <v-radio-group v-model="userSelected" class="mt-0">
            <v-list-item-group color="primary">
              <v-list-item
                v-for="user in usersFormatted"
                :key="user.uid"
                @click="handleSaveChatRoom(null, user.uid)"
              >
                <v-avatar
                  size="35"
                  color="primary"
                  class="avatar-enter-user | mr-4"
                >
                  <img
                    v-if="user.avatar"
                    alt="Avatar"
                    :src="user.avatar.url"
                    class="img"
                  />

                  <span v-else class="white--text text-h8">{{
                    user.name.charAt(0) + user.lastName.charAt(0)
                  }}</span>
                </v-avatar>

                <span class="ml-2 mt-0">{{
                  user.name + ' ' + user.lastName
                }}</span>
              </v-list-item>
            </v-list-item-group>
            <h5
              v-if="usersFormatted.length === 0"
              style="color: gray"
              class="d-flex justify-center"
            >
              {{ $t('listUsersV') }}
            </h5>
          </v-radio-group>
        </v-list>
      </div>

      <!-- Chat Drawer, chat entre grupos -->
      <div class="mx-auto overflow-hidden">
        <v-navigation-drawer
          v-model="drawerNewChatGroup"
          absolute
          temporary
          width="300"
        >
          <div class="header-group | d-flex flex-row">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="mr-1 ml-1 mt-4"
                  v-bind="attrs"
                  v-on="on"
                  @click="leftDrawerNewChatGroup()"
                  ><v-icon>mdi-arrow-left</v-icon></v-btn
                >
              </template>
              <span>{{ $t('back') }}</span>
            </v-tooltip>
            <v-avatar
              color="accent"
              size="45"
              style="overflow: visible"
              class="ma-3 ml-0"
            >
              <v-btn
                v-if="newChatGroup.image != null"
                icon
                x-small
                class="btn-delete"
                style="position: absolute; bottom: 2rem; left: 2rem"
                @click="handleDeleteFile"
              >
                <v-icon color="red" x-small
                  >mdi-close-circle-outline</v-icon
                ></v-btn
              >
              <v-form ref="avatarForm">
                <v-file-input
                  v-model="newChatGroup.file"
                  class="camera"
                  dense
                  hide-input
                  :rules="rules"
                  accept="image/png, image/jpeg, image/bmp"
                  prepend-icon="mdi-camera"
                  @change="handleInputFiles($event, 'avatarForm')"
                ></v-file-input>
              </v-form>
              <img
                v-if="newChatGroup.image != null"
                :src="newChatGroup.image"
                class="img"
              />
            </v-avatar>

            <v-form ref="groupName">
              <v-text-field
                v-model="newChatGroup.name"
                class="ml-0 mt-6"
                :label="$t('groupName')"
                :rules="nameRules"
                dense
                hide-details="auto"
                required
              ></v-text-field>
            </v-form>
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  color="primary"
                  :ripple="false"
                  class="d-flex mt-4 ml-2"
                  @click="handleSearch"
                >
                  <v-icon v-bind="attrs" v-on="on">{{
                    openSearch ? 'mdi-close ' : 'mdi-magnify'
                  }}</v-icon>
                </v-btn>
              </template>
              <span>{{ !openSearch ? $t('search') : $t('close') }}</span>
            </v-tooltip>
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="ml-2 mr-1 mt-4"
                  :loading="loadingNewChatGroup"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleSaveChatRoom('groupName')"
                  ><v-icon>mdi-arrow-right</v-icon></v-btn
                >
              </template>
              <span>{{ $t('createGroup') }}</span>
            </v-tooltip>
          </div>

          <transition name="growDown">
            <v-text-field
              v-show="openSearch"
              ref="searchInput"
              v-model="search"
              class="search-input ma-2"
              dense
              outlined
              :placeholder="$t('search')"
              hide-details="auto"
            ></v-text-field>
          </transition>
          <v-divider></v-divider>
          <div class="users-list | pb-8 h-100">
            <v-list v-if="users.length" nav>
              <v-list-item
                v-for="(user, i) in allUsersEditFormatted"
                :key="i"
                class="user-item"
              >
                <v-avatar size="35" color="primary" class="font-size | mr-4">
                  <img
                    v-if="user.avatar"
                    alt="Avatar"
                    :src="user.avatar.url"
                    class="img"
                  />

                  <span v-else class="white--text text-h8">{{
                    user.name.charAt(0) + user.lastName.charAt(0)
                  }}</span>
                </v-avatar>

                <span class="ml-2 mt-0 mr-2">{{
                  user.name + ' ' + user.lastName
                }}</span>
                <v-spacer></v-spacer>

                <div class="mt-0">
                  <v-simple-checkbox
                    v-model="user.isSelected"
                    dense
                    color="primary"
                  ></v-simple-checkbox>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </v-navigation-drawer>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { serverTimestamp } from 'firebase/firestore'
import { mapState } from 'vuex'
export default {
  name: 'ChatDrawerNewChatRoom',
  data() {
    return {
      loadingNewChatGroup: false,
      userSelected: '',
      isSelected: null,
      allUsersEdit: [],
      newChatGroup: {
        name: '',
        file: null,
        avatar: {},
        image: null,
        createdBy: null,
      },
      name: '',
      nameRules: [(v) => !!v || this.$t('groupNameRequired')],
      rules: [
        (value) => !value || value.size < 2000000 || this.$t('avatarRequired'),
      ],
      openSearch: false,
      search: '',
    }
  },
  computed: {
    drawerNewChat: {
      get() {
        return this.$store.state.chats.drawerNewChat
      },
      set(val) {
        this.openSearch = false
        this.search = ''
        this.$store.commit('chats/set_drawerNewChat', val)
      },
    },
    drawerNewChatGroup: {
      get() {
        return this.$store.state.chats.drawerNewChatGroup
      },
      set(val) {
        this.openSearch = false
        this.search = ''
        this.$store.commit('chats/set_drawerNewChatGroup', val)
      },
    },
    ...mapState({
      user: (state) => state.auth.user,
      chatRooms: (state) => state.chats.chatRooms,
      users: (state) => state.chats.users,
    }),
    usersFormatted() {
      const _users = this.users
        .filter((user) => {
          let bool = true
          this.chatRooms.forEach((element) => {
            if (!element.isGroup) {
              if (element.subscribers[0].uid === user.uid) {
                bool = false
              }
            }
          })
          return bool
        })
        .map((c) => c)
        .sort((a, b) => {
          return a.fullName > b.fullName ? 1 : -1
        })

      const filterKey = this.search && this.search.toLowerCase()
      let _usersFilter = _users

      if (filterKey) {
        _usersFilter = _usersFilter.filter(function (row) {
          row = { name: row.fullName }

          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().includes(filterKey)
          })
        })
      }
      return _usersFilter
    },
    allUsersEditFormatted() {
      const _users = this.allUsersEdit
        .map((c) => c)
        .sort((a, b) => {
          return a.fullName > b.fullName ? 1 : -1
        })

      const filterKey = this.search && this.search.toLowerCase()
      let _usersFilter = _users

      if (filterKey) {
        _usersFilter = _usersFilter.filter(function (row) {
          row = { name: row.fullName }

          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().includes(filterKey)
          })
        })
      }
      return _usersFilter
    },
  },
  watch: {
    users() {
      this.initializeUsers()
    },
    drawerNewChat() {
      this.resetDrawerNewChatGroup()
    },
  },
  async mounted() {
    try {
      await this.$store.dispatch('chats/getAllUsers')
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },
  methods: {
    initializeUsers() {
      this.allUsersEdit = JSON.parse(JSON.stringify(this.users))
    },
    async handleSaveChatRoom(ref, userToChatUid) {
      try {
        this.loadingNewChatGroup = true
        const admin = []
        admin.push(this.user.profile.uid)

        const newChatRoom = {
          createdAt: serverTimestamp(),
          isOrderChat: false,
          active: true,
        }

        if (!userToChatUid) {
          if (!this.$refs[ref].validate()) {
            this.loadingNewChatGroup = false
            return
          }
          if (
            this.allUsersEdit
              .filter((subs) => subs.isSelected)
              .map((user) => user.uid).length === 0
          ) {
            this.loadingNewChatGroup = false
            this.$mainAlertError(this.$t('oopsProblemGroup'))
            return
          }
          newChatRoom.name = this.newChatGroup.name
          newChatRoom.isGroup = true
          newChatRoom.createdBy = this.user.profile.uid
          newChatRoom.admins = admin
          newChatRoom.subscribers = this.allUsersEdit
            .filter((subs) => subs.isSelected)
            .map((user) => user.uid)

          newChatRoom.subscribers.push(this.user.profile.uid)

          newChatRoom.file = this.newChatGroup.file
          this.resetDrawerNewChatGroup(ref)
        } else {
          newChatRoom.isGroup = false
          newChatRoom.subscribers = [this.user.profile.uid, userToChatUid]
        }
        await this.$store.dispatch('chats/create_chatRoom', {
          newChatRoom,
        })

        this.loadingNewChatGroup = false
        this.$mainAlertSuccess(this.$t('createdChat'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error-code: ', error)
        this.loadingNewChatGroup = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },

    handleInputFiles(file, ref) {
      if (!this.$refs[ref].validate()) {
        return
      }
      this.newChatGroup.image = URL.createObjectURL(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target.result
        this.avatar = {
          url,
          type: file.type,
        }
      }
      reader.readAsDataURL(file)
    },

    resetDrawerNewChatGroup() {
      this.$refs.avatarForm.resetValidation()
      this.$refs.groupName.reset()
      this.newChatGroup.name = ''
      this.newChatGroup.file = null
      this.newChatGroup.avatar = {}
      this.newChatGroup.image = null
      this.allUsersEdit.filter((subs) =>
        subs.isSelected ? (subs.isSelected = false) : ''
      )
    },
    leftDrawerNewChatGroup() {
      this.drawerNewChatGroup = false
      this.resetDrawerNewChatGroup()
    },
    handleDeleteFile() {
      this.newChatGroup.file = null
      this.newChatGroup.avatar = {}
      this.newChatGroup.image = null
    },
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
  },
}
</script>

<style lang="scss" scoped>
.users-list {
  overflow-y: auto;
}
.btn-user-list {
  width: 100%;
  margin: 0;
  padding: 0;
  position: absolute;
  opacity: 0;
}
.avatar-enter-user {
  margin-left: 10px;
  font-size: 15px;
}
.camera {
  position: absolute;
  right: 0;
  z-index: 10;
  margin: -1rem 0.1rem 0 0;
}
.img {
  object-fit: cover;
}
.font-size {
  font-size: 15px;
}
.loading {
  width: 100%;
  height: 100%;
  background: #aaa;
  opacity: 0.2;
  position: absolute;
  z-index: 5;
}
.btn-delete {
  position: absolute;
  bottom: 1.8rem;
  left: 2.2rem;
}

::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-input {
  width: 284px;
}

.growDown-enter-active,
.growDown-leave-active {
  transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
}
.growDown-enter,
.growDown-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
.theme--dark {
  .header-group {
    background-color: #1c2226;
  }
}
</style>
