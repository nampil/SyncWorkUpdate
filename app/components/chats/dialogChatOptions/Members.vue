<template>
  <div>
    <v-card
      v-if="listMiembros"
      class="elevation-0 mx-auto overflow-hidden d-flex flex-column"
      max-height="400px"
    >
      <v-toolbar color="primary" dense class="flex-grow-0">
        <v-icon class="mr-4" color="white">mdi-account-group</v-icon>
        <v-toolbar-title class="d-flex aling-center">
          {{ $t('members') }}
        </v-toolbar-title>
      </v-toolbar>

      <div
        v-if="
          roomSelectedFormatted &&
          roomSelectedFormatted.subscribers &&
          roomSelectedFormatted.subscribers !== null &&
          roomSelectedFormatted.subscribers.length
        "
        class="users-list | flex-grow-1 overflow-y-auto"
      >
        <v-list-item
          v-for="(user, i) in roomSelectedFormatted.subscribers"
          :key="i"
          class="active-list"
        >
          <v-avatar size="35" color="primary" class="mr-4 ml-2">
            <img
              v-if="user.avatar"
              alt="Avatar"
              :src="user.avatar.url"
              class="img"
            />

            <span
              v-else-if="user.name && user.lastName"
              class="white--text text-h8"
              >{{ user.name.charAt(0) + user.lastName.charAt(0) }}</span
            >
          </v-avatar>

          <span v-if="user.name && user.lastName" class="ml-2 mt-0">{{
            user.name + ' ' + user.lastName
          }}</span>
          <v-spacer></v-spacer>

          <v-icon
            v-if="user.uid !== roomSelectedFormatted.createdBy"
            color="red"
            size="20"
            class="ml-auto mr-4"
            @click="
              ;(idMember = user.uid) &&
                (dialogDeleteMember = !dialogDeleteMember)
            "
            >mdi-account-multiple-remove</v-icon
          >
          <span v-else class="color-propietario | ml-auto mr-3">{{
            $t('owner')
          }}</span>
        </v-list-item>
      </div>
      <span
        v-else-if="!user.length"
        class="mt-2 mb-2 d-flex justify-center grey--text"
      >
        {{ $t('memberList') }}</span
      >
      <v-divider></v-divider>

      <v-card-actions class="d-flex justify-end pa-4 flex-grow-0">
        <v-btn
          class="mr-4"
          color="error"
          dense
          outlined
          :disabled="loading"
          @click="closeDialogMiembros()"
          >{{ $t('close') }}</v-btn
        >
        <v-btn
          class="mr-4"
          dense
          color="secondary"
          :loading="loading"
          @click="listMiembros = !listMiembros"
          >{{ $t('add') }}</v-btn
        >
      </v-card-actions>
    </v-card>

    <!--add miembros -->
    <v-card
      v-else
      class="elevation-0 mx-auto overflow-hidden d-flex flex-column"
      max-height="400px"
    >
      <v-toolbar color="primary" dense class="flex-grow-0">
        <v-toolbar-title class="d-flex aling-center">
          <v-icon class="mr-4" color="white">mdi-account-multiple-plus</v-icon>

          <span class="ma-0 text-h5 white--text"
            >{{ $t('addMembers') }}
          </span></v-toolbar-title
        >
      </v-toolbar>

      <div
        v-if="allUsersEdit.length"
        class="users-list | mt-2 flex-grow-1 overflow-y-auto"
      >
        <v-list-item
          v-for="(user, i) in allUsersEdit"
          :key="i"
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
            v-model="user.isSelectedMembers"
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
        {{ $t('memberList') }}</span
      >
      <v-divider></v-divider>
      <v-card-actions class="d-flex justify-end pa-4 flex-grow-0">
        <v-btn
          class="mr-4"
          color="error"
          dense
          outlined
          :disabled="loading"
          @click="cancelMiembros()"
          >{{ $t('back') }}</v-btn
        >
        <v-btn
          class="mr-4"
          dense
          color="secondary"
          :loading="loading"
          @click="addMiembros()"
          >{{ $t('addSelection') }}</v-btn
        >
      </v-card-actions>
    </v-card>
    <!-- Dialog confirm delete Member -->
    <v-dialog
      v-model="dialogDeleteMember"
      persistent
      :overlay="false"
      max-width="360px"
      transition="dialog-transition"
    >
      <v-card class="elevation-0">
        <v-toolbar color="primary" dense>
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pt-7 pb-5 text-center">
          <span class="text-body-1">{{ $t('alertTextDeleterMember') }}</span>
        </v-card-text>

        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            class="mr-4"
            color="error"
            dense
            outlined
            :disabled="loading"
            @click="dialogDeleteMember = !dialogDeleteMember"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn
            class="mr-4"
            dense
            color="secondary"
            :loading="loadingDialog"
            @click="deleteConfirmMember(idMember)"
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
      listMiembros: true,
      dialogMiembros: false,
      dialogDeleteMember: false,
      idMember: null,
      allUsersEdit: [],
      isSelectedMembers: null,
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
      const UserEdit = JSON.parse(JSON.stringify(this.users))
      this.allUsersEdit = UserEdit.filter((user) => {
        if (this.roomSelectedFormatted && this.roomSelectedFormatted.isGroup) {
          const admin = this.roomSelectedFormatted.admins.findIndex(
            (e) => e.uid === user.uid
          )
          const subcribers = this.roomSelectedFormatted.subscribers.findIndex(
            (e) => e.uid === user.uid
          )

          if (admin > -1 || subcribers > -1) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      })
    },
    async addMiembros() {
      const newSubscribers = this.allUsersEdit
        .filter((subs) => subs.isSelectedMembers)
        .map((user) => user.uid)
      if (this.roomSelectedFormatted && this.roomSelectedFormatted.isGroup) {
        for (
          let i = 0;
          i < this.roomSelectedFormatted.subscribers.length;
          i++
        ) {
          newSubscribers.push(this.roomSelectedFormatted.subscribers[i].uid)
        }
        newSubscribers.push(this.user.profile.uid)
      }

      if (
        this._.isEqual(
          newSubscribers.filter((subs) => subs !== this.user.profile.uid),
          this.roomSelectedFormatted.subscribers.map((s) => s.uid)
        )
      ) {
        return
      }
      this.loading = true
      try {
        await this.$store.dispatch('chats/update_members', {
          chatRoomId: this.roomSelected,
          newSubscribers,
        })
        this.listMiembros = !this.listMiembros
        this.loading = false

        this.$mainAlertSuccess(this.$t('successAddMembers'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error geting chats', error)
        this.loading = false

        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async deleteConfirmMember(uid) {
      this.loadingDialog = true
      const newSubscribers = this.roomSelectedFormatted.subscribers.map(
        (user) => user.uid
      )
      newSubscribers.push(this.user.profile.uid)

      if (newSubscribers.length) {
        for (let i = 0; i < newSubscribers.length; i++) {
          if (newSubscribers[i] === uid) {
            newSubscribers.splice(i, 1)
          }
        }
      }

      // console.log(newSubscribers)
      try {
        await this.$store.dispatch('chats/update_members', {
          chatRoomId: this.roomSelected,
          newSubscribers,
        })

        this.loadingDialog = false
        this.dialogDeleteMember = false
        this.$mainAlertSuccess(this.$t('successDeleteMembers'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error geting chats', error)
        this.loadingDialog = false
        this.dialogDeleteMember = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    cancelMiembros() {
      this.allUsersEdit.filter((subs) =>
        subs.isSelectedMembers ? (subs.isSelectedMembers = false) : ''
      )
      this.listMiembros = !this.listMiembros
    },
    closeDialogMiembros() {
      this.dialogMiembros = false
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.img {
  object-fit: cover;
}
.active-list:hover {
  background-color: rgba(128, 128, 128, 0.081);
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
