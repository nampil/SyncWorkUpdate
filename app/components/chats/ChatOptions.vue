<template>
  <div>
    <v-menu
      bottom
      min-width="170px"
      max-width="190px"
      rounded
      offset-y
      transition="slide-y-transition"
    >
      <!-- eslint-disable-next-line  -->
      <template v-slot:activator="{ on: menu, attrs }">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              class="mr-2"
              icon
              small
              v-bind="attrs"
              v-on="{ ...tooltip, ...menu }"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('actions') }}</span>
        </v-tooltip>
      </template>

      <v-card>
        <div
          v-if="roomSelectedFormatted && roomSelectedFormatted.isGroup"
          class="text-center"
        >
          <v-list nav>
            <div
              v-if="
                roomSelectedFormatted.admins.includes(user.profile.uid) ||
                isAdminAuthorized
              "
            >
              <v-list-item-title class="active-list" @click="editarDialog()"
                >{{ $t('edit') }}
              </v-list-item-title>
              <v-divider class="my-2"></v-divider>
            </div>

            <div
              v-if="
                roomSelectedFormatted.admins.includes(user.profile.uid) ||
                isAdminAuthorized
              "
            >
              <v-list-item-title
                class="active-list"
                @click="editarDialogMiembros()"
              >
                {{ $t('members') }}
              </v-list-item-title>
              <v-divider class="my-2"></v-divider>
            </div>
            <div
              v-if="
                roomSelectedFormatted.admins.includes(user.profile.uid) ||
                isAdminAuthorized
              "
            >
              <v-list-item-title class="active-list" @click="adminDialog()">
                {{ $t('administrators') }}
              </v-list-item-title>
              <v-divider class="my-2"></v-divider>
            </div>
            <div v-if="roomSelectedFormatted.createdBy === user.profile.uid">
              <v-list-item-title
                class="active-list"
                @click="deleteDialog($t('group'))"
              >
                {{ $t('delete') }}
              </v-list-item-title>
            </div>
            <div v-if="roomSelectedFormatted.createdBy !== user.profile.uid">
              <v-list-item-title
                class="active-list"
                @click="dialogDeleteSalir()"
                >{{ $t('leave') }}</v-list-item-title
              >
            </div>
          </v-list>
        </div>
        <!-- Si es un chat entre user -->
        <div
          v-if="roomSelectedFormatted && !roomSelectedFormatted.isGroup"
          class="text-center"
        >
          <v-list-item-title
            class="active-list"
            @click="deleteDialog('chat')"
            >{{ $t('delete') }}</v-list-item-title
          >
        </div>
      </v-card>
    </v-menu>
    <!-- Dialogo deleter group y user -->
    <v-dialog
      v-model="dialogDelete"
      :persistent="false"
      :overlay="false"
      max-width="360px"
      transition="dialog-transition"
    >
      <DeleterGroupAndUser :type="typeDelete" @close="dialogDelete = false">
      </DeleterGroupAndUser>
    </v-dialog>
    <!-- Dialogo Edit group -->
    <v-dialog
      v-model="dialogEdit"
      :persistent="false"
      :overlay="false"
      max-width="360px"
      transition="dialog-transition"
    >
      <EditGroup
        v-if="dialogEdit"
        :chatgroupname="newChatGroup"
        @close="dialogEdit = false"
      ></EditGroup>
    </v-dialog>
    <!-- Dialog salir de group -->
    <v-dialog
      v-model="dialogSalir"
      persistent
      :overlay="false"
      max-width="360px"
      transition="dialog-transition"
    >
      <LeaveGroup @close="dialogSalir = false"></LeaveGroup>
    </v-dialog>

    <!-- Dialog miembros -->
    <v-dialog
      v-model="dialogMiembros"
      :persistent="false"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <Members @close="dialogMiembros = false"></Members>
    </v-dialog>

    <!-- Dialog Administradores -->
    <v-dialog
      v-model="dialogAdmin"
      :persistent="false"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <Admins @close="dialogAdmin = false"></Admins>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DeleterGroupAndUser from './dialogChatOptions/DeleterGroupAndUser'
import LeaveGroup from './dialogChatOptions/LeaveGroup'
import Members from './dialogChatOptions/Members.vue'
import Admins from './dialogChatOptions/Admins.vue'
import EditGroup from './dialogChatOptions/EditGroup.vue'
import { ROL_TYPES } from '@/utils/dictionaries'

export default {
  components: { DeleterGroupAndUser, LeaveGroup, Members, Admins, EditGroup },
  data() {
    return {
      idAdmin: null,
      loading: false,
      dialogDelete: false,
      dialogEdit: false,
      dialogSalir: false,
      dialogMiembros: false,
      dialogAdmin: false,
      typeDelete: '',
      newChatGroup: {
        name: '',
        file: null,
        image: null,
        imageId: '',
      },
      ROL_TYPES: null,
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

      return {
        ..._roomSelected,
        chats: _roomSelected.chats
          .map((c) => c)
          .sort((a, b) => {
            return a.createdAt.getTime() > b.createdAt.getTime() ? 1 : -1
          }),
      }
    },
    isAdminAuthorized() {
      return (
        this.user.userCredential?.claims?.authLevel > 6 &&
        this.user.userCredential?.claims?.rol === this.ROL_TYPES.admin
      )
    },
  },
  watch: {
    datos() {
      this.initializeDatos()
    },
  },
  created() {
    this.ROL_TYPES = ROL_TYPES
  },
  methods: {
    initializeDatos() {
      this.newChatGroup.name = this.roomSelectedFormatted.name
      this.file = null

      if (
        typeof this.roomSelectedFormatted.roomImg !== 'undefined' &&
        JSON.stringify(this.roomSelectedFormatted.roomImg) !== '{}' &&
        this.roomSelectedFormatted.roomImg !== null
      ) {
        this.newChatGroup.image = this.roomSelectedFormatted.roomImg.url
        this.newChatGroup.imageId = this.roomSelectedFormatted.roomImg.codeName
      }
    },
    deleteDialog(type) {
      this.dialogDelete = true
      this.typeDelete = type
    },
    dialogDeleteSalir() {
      this.dialogSalir = true
    },
    adminDialog() {
      this.dialogAdmin = true
    },
    editarDialog() {
      this.dialogEdit = true
      this.initializeDatos()
    },
    editarDialogMiembros() {
      this.dialogMiembros = true
    },
  },
}
</script>
<style lang="scss" scoped>
.active-list {
  padding: 0.4rem;
}
.active-list:hover {
  background-color: rgba(128, 128, 128, 0.081);
  cursor: pointer;
  padding: 0.4rem;
}
.magin {
  margin-top: -8px;
}
.magin-b {
  margin-bottom: -8px;
}
</style>
