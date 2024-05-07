<template>
  <div class="h-100 d-flex flex-column">
    <details-toolbar-admin></details-toolbar-admin>
    <div class="users-container | pa-3 pb-8 h-100 overflow-y-auto">
      <v-data-table
        :headers="headers"
        :items="users"
        fixed-header
        class="elevation-1"
        :items-per-page="15"
        :loading="loading"
        :search="search"
        dense
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:top>
          <v-toolbar flat dark dense color="secondary">
            <v-toolbar-title>{{ $t('usersList') }}</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>

            <div class="search-box | d-flex align-center gap-8 mr-4">
              <transition>
                <div v-if="showSearch" class="search-input-wrapper">
                  <v-text-field
                    ref="searchInput"
                    v-model="search"
                    :label="$t('search')"
                    hide-details
                    dense
                    outlined
                  ></v-text-field>
                </div>
              </transition>
              <v-btn color="primary" icon @click="handleShowSearch"
                ><v-icon>mdi-magnify</v-icon></v-btn
              >
            </div>
            <v-btn small color="primary" dark @click="dialog = !dialog">
              {{ $t('add') }}
            </v-btn>
          </v-toolbar>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="28px" color="primary" class="avatar-group">
            <img
              v-if="item.avatar && item.avatar.url"
              style="object-fit: cover"
              :src="item.avatar.url"
            />
            <div v-else>
              <span v-if="item.fullName" class="white--text text-h8">{{
                item.name[0] + item.lastName[0]
              }}</span>
            </div>
          </v-avatar>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.name="{ item }">
          <router-link :to="`/admin/users/${item.uid}`" class="text-links">{{
            item.name
          }}</router-link>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.lastName="{ item }">
          <router-link :to="`/admin/users/${item.uid}`" class="text-links">{{
            item.lastName
          }}</router-link>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.email="{ item }">
          <router-link :to="`/admin/users/${item.uid}`" class="text-links">{{
            item.email
          }}</router-link>
        </template>
        <!-- eslint-disable-next-line -->
        <template v-slot:item.actions="{ item }">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                x-small
                class="mr-2"
                v-bind="attrs"
                v-on="on"
                @click="editItem(item)"
              >
                <v-icon small color="secondary"> mdi-pencil </v-icon>
              </v-btn>
            </template>
            <span>Edit User</span>
          </v-tooltip>
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                x-small
                v-bind="attrs"
                v-on="on"
                @click="deleteItem(item)"
              >
                <v-icon small color="red"> mdi-delete </v-icon>
              </v-btn>
            </template>
            <span>Delete User</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <div
        v-if="userClaims && parseInt(userClaims.authLevel) === 10"
        class="send-messages-to-users | pt-9 pb-4"
      >
        <send-messages-to-users :users="users" />
      </div>

      <add-user
        :show="dialog"
        :loading="loading"
        :form-title="formTitle"
        :edited-item="editedItem"
        :edited-index="editedIndex"
        :departments-templates="departmentsTemplates"
        @close="close"
      />

      <dialog-delete
        :show="dialogDelete"
        :loading="loading"
        @close-delete="closeDelete"
        @delete-item-confirm="deleteItemConfirm"
      />
    </div>
  </div>
</template>

<script>
import sendMessagesToUsers from '../../../components/admin/users/SendMessagesToUsers'
import DialogDelete from '~/components/admin/templates/dialogs/DialogDelete.vue'
import AddUser from '~/components/admin/users/AddUser.vue'
import DetailsToolbarAdmin from '~/components/admin/templates/DetailsToolbarAdmin.vue'

export default {
  name: 'AddUsersComp',
  components: {
    sendMessagesToUsers,
    DialogDelete,
    AddUser,
    DetailsToolbarAdmin,
  },
  layout: 'dash',
  data() {
    return {
      loading: false,
      dialog: false,
      dialogDelete: false,
      viewPass: false,
      search: '',
      showSearch: false,
      headers: [
        {
          text: 'Avatar',
          align: 'start',
          value: 'avatar',
        },
        {
          text: this.$t('name'),
          align: 'start',
          value: 'name',
        },
        { text: this.$t('lastName'), value: 'lastName' },
        { text: this.$t('email'), value: 'email' },
        { text: this.$t('role'), value: 'customClaims.rol' },
        { text: this.$t('authLevel'), value: 'customClaims.authLevel' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],

      datesAdmin: null,
      departmentsTemplates: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        lastName: '',
        email: '',
        password: '',
        rol: null,
        authLevel: 0,
        nickname: '',
        companyName: '',
        phoneNumber: null,
        comments: '',
        address: '',
        appAccess: false,
        webAccess: false,
        departments: [],
      },
      defaultItem: {
        name: '',
        lastName: '',
        email: '',
        password: '',
        rol: null,
        authLevel: 0,
        nickname: '',
        companyName: '',
        phoneNumber: null,
        comments: '',
        address: '',
        appAccess: false,
        webAccess: false,
        departments: [],
      },
    }
  },
  computed: {
    userClaims() {
      return this.$store.state.auth.user.userCredential.claims
    },
    user() {
      return this.$store.state.auth.user
    },
    users() {
      return this.$store.state.admin.users.usersTemplates
    },
    formTitle() {
      return this.editedIndex === -1 ? this.$t('newUser') : this.$t('editUser')
    },
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.initialize()
    this.initializeDepartments()
  },
  methods: {
    handleShowSearch() {
      if (this.showSearch) {
        this.search = ''
        this.showSearch = false
        return
      }
      this.search = ''
      this.showSearch = true

      this.$nextTick(() => {
        this.$refs.searchInput.focus()
      })
    },
    async initialize() {
      this.loading = true
      try {
        await this.$store.dispatch('admin/users/get_users')
        // this.users = _users && _users.length ? [..._users] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    async initializeAdmin(uid) {
      this.loading = true
      try {
        const _datesAdmin = await this.$store.dispatch(
          'admin/users/get_datesAdmin',
          uid
        )
        this.datesAdmin = _datesAdmin
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeDepartments() {
      this.loading = true
      try {
        const _departments = await this.$store.dispatch(
          'admin/orders/get_departments'
        )
        this.departmentsTemplates =
          _departments && _departments.length ? _departments : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async editItem(item) {
      await this.initializeAdmin(item.uid)
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, { ...item, ...this.datesAdmin })
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      this.loading = true
      const { uid } = this.users[this.editedIndex]

      const objectToSend = {
        archived: true,
        disabled: true,
        appAccess: false,
        webAccess: false,
        authLevel: 0,
        uid,
      }
      try {
        await this.$store.dispatch('admin/users/update_user', {
          objectToSend,
          type: 'delete',
        })
        // this.users.splice(this.editedIndex, 1)

        this.$mainAlertSuccess(this.$t('successDelete'))
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
        this.pictureAvatar = null

        this.closeDelete()
      }
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.send-messages-to-users {
  max-width: 50%;
}
.text-links {
  color: inherit;
  text-decoration: none;
}
.v-enter-active,
.v-leave-active {
  transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
}
.v-enter,
.v-leave-to {
  opacity: 0;
  transform: translateX(20%);
}
</style>
