<template>
  <div class="routeStatus-templates | h-100 pa-3 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="routeStatus"
      fixed-header
      class="elevation-1"
      :items-per-page="15"
      :loading="loading"
      :search="search"
      dense
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:top>
        <v-toolbar flat dense dark color="secondary">
          <v-toolbar-title> Order Status Template</v-toolbar-title>
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
          <v-dialog
            v-model="dialog"
            max-width="1000px"
            :overlay="false"
            transition="dialog-transition"
            :persistent="localNeedToSave"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn small color="primary" dark v-bind="attrs" v-on="on">
                {{ $t('add') }}
              </v-btn>
            </template>

            <v-card class="elevation-0">
              <v-toolbar color="secondary" dense>
                <v-btn icon dark @click="handleCancel">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title class="d-flex aling-center">
                  {{ formTitle }}</v-toolbar-title
                >
                <v-spacer></v-spacer>
                <v-toolbar-items
                  ><v-btn
                    v-if="editedIndex === -1"
                    ref="botonSave"
                    text
                    :loading="loading"
                    @click="handleAddTaskTemplate()"
                  >
                    {{ $t('send') }}
                  </v-btn>
                  <v-btn
                    v-else
                    ref="botonUpdate"
                    text
                    :loading="loading"
                    :disabled="validateForm"
                    @click="handleUpdateTaskTemplate()"
                  >
                    {{ $t('update') }}
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-card-text>
                <v-container class="mt-3">
                  <v-form ref="newOrderStatusForm">
                    <v-row>
                      <v-col cols="10">
                        <v-text-field
                          v-model="newStatus.title"
                          :label="$t('title')"
                          :rules="titleRules"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>

                      <div class="ml-3">
                        <v-switch
                          v-model="newStatus.active"
                          class="switch-active"
                          :label="$t('active')"
                          hide-details="auto"
                        ></v-switch>
                      </div>

                      <v-col cols="12">
                        <v-textarea
                          v-model="newStatus.desc"
                          :label="$t('description')"
                          :rules="descRules"
                          dense
                          hide-details="auto"
                          outlined
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-toolbar>
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
          <span>{{ $t('editRouteStatu') }}</span>
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
          <span>{{ $t('deleteRouteStatu') }}</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <DialogDelete
      :show="dialogDelete"
      :loading="loading"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm"
    />
  </div>
</template>

<script>
import DialogDelete from '../../../components/admin/templates/dialogs/DialogDelete'
export default {
  name: 'OrdersStatusTemplates',
  components: { DialogDelete },

  data() {
    return {
      newStatus: {
        title: '',
        desc: '',
        active: true,
      },
      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          value: 'title',
          width: '30%',
        },
        { text: this.$t('description'), value: 'desc' },
        { text: this.$t('active'), value: 'active' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      routeStatus: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        desc: '',
        active: true,
      },
      defaultItem: {
        title: '',
        desc: '',
        active: true,
      },
      search: '',
      showSearch: false,
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? 'New Order Statu template'
        : 'Edit Order Statu template'
    },
    validateForm() {
      if (this.editedIndex === -1 && !this.localNeedToSave) {
        return true
      } else if (this.editedIndex !== -1 && !this.localNeedToSave) {
        return true
      }
      return false
    },
    localNeedToSave() {
      const compareItems = (A, B) => {
        return this._.isEqual(A, B)
      }
      if (this.editedIndex === -1) {
        return !compareItems(this.newStatus, this.defaultItem)
      }
      const propertiesToCheck = ['desc', 'title', 'active']
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newStatus[p], this.editedItem[p])
      })
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
      if (this.editedIndex === -1) {
        this.cleanUp()
      }
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  created() {
    this.initialize()
  },
  methods: {
    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newOrderStatusForm) return
      this.$refs.newOrderStatusForm.resetValidation()
      this.$nextTick(() => {
        this.newStatus = JSON.parse(JSON.stringify(this.defaultItem))
      })
    },

    async handleAddTaskTemplate() {
      const type = 'orderStatus'

      if (!this.$refs.newOrderStatusForm.validate()) {
        return
      }
      const _title = this.newStatus.title?.trim().toLowerCase()

      this.loading = true
      try {
        const objectToSend = {
          title: _title[0].toUpperCase() + _title.slice(1),
          desc: this.newStatus.desc,
          active: this.newStatus.active || false,
        }
        await this.$store.dispatch(`admin/orders/add_task_templates`, {
          objectToSend,
          type,
        })
        this.loading = false
        this.cleanUp()
        this.$mainAlertSuccess(this.$t('successTemplateAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.loading = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
      this.save()
    },
    async handleUpdateTaskTemplate() {
      const type = 'orderStatus'

      if (!this.$refs.newOrderStatusForm.validate()) {
        return
      }
      const _title = this.newStatus.title?.trim().toLowerCase()
      this.loading = true
      try {
        const objectToSend = {
          title: _title[0].toUpperCase() + _title.slice(1),
          desc: this.newStatus.desc,
          id: this.editedItem.id,
          active: this.newStatus.active,
        }

        await this.$store.dispatch(`admin/orders/update_task_template`, {
          objectToSend,
          type,
        })
        this.cleanUp()
        this.$mainAlertSuccess(this.$t('successTemplateUpdate'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)

        this.$mainAlertError(this.$t('embarrassingError'))
      }
      this.save()
    },
    async initialize() {
      const _type = 'orderStatus'
      this.loading = true
      try {
        const _items = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.routeStatus = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    editItem(item) {
      this.editedIndex = this.routeStatus.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newStatus.title = this.editedItem.title
      this.newStatus.desc = this.editedItem.desc
      this.newStatus.active = this.editedItem.active
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.routeStatus.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.loading = true
      const type = 'orderStatus'
      const objectDelete = this.routeStatus[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.routeStatus.splice(this.editedIndex, 1)
        this.closeDelete()
        this.$mainAlertSuccess(this.$t('successTemplateDelete'))
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
        this.closeDelete()
      }
    },
    close() {
      this.dialog = false
      this.$refs.newOrderStatusForm.resetValidation()
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
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.routeStatus[this.editedIndex], this.editedItem)
      } else {
        this.routeStatus.push(this.editedItem)
      }
      this.initialize()
      this.close()
    },
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
  },
}
</script>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
}
.v-enter,
.v-leave-to {
  opacity: 0;
  transform: translateX(20%);
}
::v-deep.v-data-table--dense > .v-data-table__wrapper {
  overflow-y: hidden;
}
</style>
