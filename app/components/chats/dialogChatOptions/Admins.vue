<template>
  <div>
    <v-card
      v-if="listAdmin"
      class="elevation-0 mx-auto overflow-hidden d-flex flex-column"
      max-height="400px"
    >
      <v-toolbar color="primary" dense class="flex-grow-0">
        <v-toolbar-title class="d-flex aling-center">
          <v-icon class="mr-4" color="white">mdi-account-group</v-icon>
          <span class="ma-0 text-h5 white--text">{{
            $t('administrators')
          }}</span></v-toolbar-title
        >
      </v-toolbar>
      <div
        v-if="roomSelectedFormatted"
        class="users-list | mt-0 flex-grow-1 overflow-y-auto"
      >
        <v-list-item
          v-for="_user in adminEditAdmins"
          :key="_user.id"
          class="active-list"
        >
          <v-avatar size="35" color="primary" class="mr-4 ml-2">
            <img
              v-if="_user.avatar"
              alt="Avatar"
              :src="_user.avatar.url"
              class="img"
            />

            <span v-else class="white--text text-h8">{{
              _user.name.charAt(0) + _user.lastName.charAt(0)
            }}</span>
          </v-avatar>

          <span class="ml-2 mt-0">{{ _user.name + ' ' + _user.lastName }}</span>
          <v-spacer></v-spacer>
          <span v-if="_user.creator" class="color-propietario | ml-auto mr-3">{{
            $t('owner')
          }}</span>

          <div
            v-if="
              roomSelectedFormatted &&
              roomSelectedFormatted.isGroup &&
              !_user.creator
            "
          >
            <v-btn
              class="ml-auto mr-3"
              icon
              small
              color="red"
              @click="handleShowDeleteAdmin(_user.uid)"
            >
              <v-icon size="20"> mdi-account-multiple-remove</v-icon>
            </v-btn>
          </div>
        </v-list-item>
      </div>
      <v-divider></v-divider>

      <v-card-actions class="d-flex justify-end pa-4 flex-grow-0">
        <v-btn
          class="mr-4"
          color="error"
          dense
          outlined
          :disabled="loading"
          @click="closeDeleteDialogAdmins()"
          >{{ $t('close') }}</v-btn
        >
        <v-btn
          class="mr-4"
          dense
          color="secondary"
          :loading="loading"
          @click="listAdmin = !listAdmin"
          >{{ $t('add') }}</v-btn
        >
      </v-card-actions>
    </v-card>
    <!-- Agregar Administradores de (Subcribers) -->
    <v-card
      v-else
      class="elevation-0 mx-auto overflow-hidden d-flex flex-column"
      max-height="400px"
    >
      <v-toolbar color="primary" dense class="flex-grow-0">
        <v-toolbar-title class="d-flex aling-center">
          <v-icon class="mr-4" color="white">mdi-account-multiple-plus</v-icon>
          <span class="ma-0 text-h5 white--text">{{
            $t('addAdmins')
          }}</span></v-toolbar-title
        >
      </v-toolbar>
      <div
        v-if="roomSelectedFormatted && AdminEditSubscribers.length"
        class="users-list | mt-2 flex-grow-1 overflow-y-auto"
      >
        <v-list-item
          v-for="user in AdminEditSubscribers"
          :key="user.id"
          class="active-list"
        >
          <v-avatar size="35" color="primary" class="mr-4 ml-2">
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

          <span class="ml-2 mt-0">{{ user.name + ' ' + user.lastName }}</span>
          <v-simple-checkbox
            v-model="user.isSelectedAdmin"
            class="ml-auto mr-2"
            dense
            color="primary"
          ></v-simple-checkbox>
        </v-list-item>
      </div>
      <span
        v-else-if="!user.length"
        class="mt-2 mb-2 d-flex justify-center grey--text"
      >
        {{ $t('adminList') }}</span
      >
      <v-divider></v-divider>
      <v-card-actions class="d-flex justify-end pa-4 flex-grow-0">
        <v-btn
          class="mr-4"
          color="error"
          dense
          outlined
          :disabled="loading"
          @click="cancelAdmins()"
          >{{ $t('back') }}</v-btn
        >
        <v-btn
          class="mr-4"
          dense
          color="secondary"
          :loading="loading"
          @click="AddAdmins()"
          >{{ $t('addSelection') }}</v-btn
        >
      </v-card-actions>
    </v-card>
    <!-- Confirm delete Admin -->
    <v-dialog
      v-model="dialogDeleteAdmin"
      persistent
      :overlay="false"
      max-width="350px"
      transition="dialog-transition"
    >
      <!-- Administradores  -->
      <v-card class="elevation-0">
        <v-toolbar color="primary" dense>
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>
        <v-card-title class="pt-7 pb-5 text-center">
          <span class="text-body-1">{{ $t('alertTextDeleterAdmin') }}</span>
        </v-card-title>
        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            class="mr-4"
            color="error"
            dense
            outlined
            :disabled="loading"
            @click="dialogDeleteAdmin = !dialogDeleteAdmin"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn
            class="mr-4"
            dense
            color="secondary"
            :loading="loadingDialog"
            @click="deleteAdmin(idAdmin)"
            >{{ $t('delete') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      loading: false,
      loadingDialog: false,
      listAdmin: true,
      isSelectedAdmin: null,
      AdminEditSubscribers: [],
      adminEditAdmins: [],
      dialogDeleteAdmin: false,
    }
  },
  computed: {
    roomSelected: {
      get() {
        return this.$store.state.chats.roomSelected
      },
      set(val) {
        this.$store.commit('chats/set_roomSelected', val)
      },
    },
    ...mapState({
      chatRooms: (state) => state.chats.chatRooms,
      user: (state) => state.auth.user,
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
      const subscribers = _roomSelected.subscribers.filter(
        (sub) => sub.name && sub.lastName
      )
      return {
        ..._roomSelected,
        subscribers,
        chats: _roomSelected.chats
          .map((c) => c)
          .sort((a, b) => {
            return a.createdAt.getTime() > b.createdAt.getTime() ? 1 : -1
          }),
      }
    },
  },
  watch: {
    users() {
      this.initializeUsers()
    },
    roomSelectedFormatted() {
      this.initializeUsers()
    },
  },
  created() {
    this.initializeUsers()
  },
  methods: {
    initializeUsers() {
      if (this.roomSelectedFormatted && this.roomSelectedFormatted.isGroup) {
        const adminIds = this.roomSelectedFormatted.admins

        this.adminEditAdmins = this.users
          .filter((user) => {
            return adminIds.includes(user.uid)
          })
          .map((user) => {
            return {
              ...user,
              ...(user.uid === this.roomSelectedFormatted.createdBy && {
                creator: true,
              }),
            }
          })
        if (adminIds.includes(this.user.profile.uid)) {
          const userProfile = {
            ...this.user.profile,
            ...(this.user.profile.uid ===
              this.roomSelectedFormatted.createdBy && {
              creator: true,
            }),
          }
          this.adminEditAdmins.push(userProfile)
        }
        /* Subscribers menos el creador ni admins */
        const _subs = JSON.parse(
          JSON.stringify(this.roomSelectedFormatted.subscribers)
        )
        this.AdminEditSubscribers = _subs.filter((subs) => {
          return (
            subs.uid !== this.roomSelectedFormatted.createdBy &&
            !this.roomSelectedFormatted.admins.includes(subs.uid)
          )
        })
      }
    },
    async AddAdmins() {
      try {
        let _newAdmins = this.AdminEditSubscribers.filter(
          (subs) => subs.isSelectedAdmin
        ).map((e) => {
          return e.uid
        })
        _newAdmins = _newAdmins.concat(this.roomSelectedFormatted.admins)

        if (this._.isEqual(_newAdmins, this.roomSelectedFormatted.admins)) {
          return
        }
        this.loading = true

        await this.$store.dispatch('chats/update_admins', {
          chatRoomId: this.roomSelected,
          newAdmins: _newAdmins,
        })

        this.loading = false
        this.listAdmin = !this.listAdmin
        this.$mainAlertSuccess(this.$t('successAddAdmin'))
      } catch (error) {
        this.loading = false
        this.listAdmin = !this.listAdmin
        // eslint-disable-next-line
        console.log('error-code: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },
    async deleteAdmin(uidAdmin) {
      this.loadingDialog = true

      const newAdmins = this.adminEditAdmins
        .filter((user) => user.uid !== uidAdmin)
        .map((u) => {
          return u.uid
        })

      try {
        await this.$store.dispatch('chats/update_admins', {
          chatRoomId: this.roomSelected,
          newAdmins,
        })

        this.loadingDialog = false
        this.dialogDeleteAdmin = !this.dialogDeleteAdmin
        this.$mainAlertSuccess(this.$t('successDeleteAdmin'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error geting chats', error)
        this.loadingDialog = false
        this.dialogDeleteAdmin = !this.dialogDeleteAdmin
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleShowDeleteAdmin(uid) {
      this.idAdmin = uid
      this.dialogDeleteAdmin = !this.dialogDeleteAdmin
    },
    cancelAdmins() {
      this.AdminEditSubscribers.filter((subs) =>
        subs.isSelectedAdmin ? (subs.isSelectedAdmin = false) : ''
      )
      this.listAdmin = !this.listAdmin
    },
    closeDeleteDialogAdmins() {
      this.dialogAdmin = false
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.active-list:hover {
  background-color: rgba(128, 128, 128, 0.081);
}
.img {
  object-fit: cover;
}
.color-propietario {
  color: var(--v-primary-base);
}
// ::v-deep .v-navigation-drawer__content,
// .users-list {
//   -ms-overflow-style: none; /* IE and Edge */
//   scrollbar-width: none; /* Firefox */
// }
// ::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
// .users-list::-webkit-scrollbar {
//   display: none; /* Chrome */
// }
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
