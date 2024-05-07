<template>
  <div class="inspections-options-templates">
    <v-card class="ma-10 mt-2 mr-2 h-100">
      <v-data-table
        :headers="headers"
        :items="inspections"
        sort-by="calories"
        class="elevation-1 h-100"
        :items-per-page="15"
        fixed-header
        height="84%"
        :loading="loading"
        :search="search"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:top>
          <v-toolbar flat dense dark color="secondary">
            <v-toolbar-title>{{ $t('inspectionsOptions') }}</v-toolbar-title>
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
                <v-toolbar dense color="secondary">
                  <v-toolbar-title class="d-flex aling-center">
                    <v-icon v-if="editedIndex === -1" class="mr-4" color="white"
                      >mdi-clipboard-plus</v-icon
                    >
                    <v-icon v-if="editedIndex !== -1" class="mr-4" color="white"
                      >mdi-clipboard-edit</v-icon
                    >

                    <span class="ma-0 text-h5 white--text">{{
                      formTitle
                    }}</span></v-toolbar-title
                  >
                </v-toolbar>

                <v-card-text>
                  <v-container class="mt-3">
                    <v-form ref="newInspectionTemplateForm">
                      <v-row>
                        <v-col cols="10">
                          <v-text-field
                            v-model="newInspectionOption.text"
                            :label="$t('textTemplate')"
                            :rules="titleRules"
                            dense
                            hide-details="auto"
                            outlined
                            @keydown.enter.exact.prevent
                            @keyup.enter.exact="handleFocusBtnActions()"
                          ></v-text-field>
                        </v-col>
                        <div class="ml-3">
                          <v-switch
                            v-model="newInspectionOption.status"
                            class="switch-status"
                            :label="
                              newInspectionOption.status
                                ? 'Enabled'
                                : 'Disabled'
                            "
                            hide-details="auto"
                          ></v-switch>
                        </div>
                        <v-col col="12" class="text-right">
                          <v-btn
                            color="error"
                            outlined
                            :disabled="loading"
                            class="mr-4"
                            @click="handleCancel()"
                            >{{ $t('cancel') }}
                          </v-btn>
                          <v-btn
                            v-if="editedIndex === -1"
                            ref="botonSave"
                            color="secondary"
                            :loading="loading"
                            :disabled="validateForm"
                            @click="handleAddTaskTemplate()"
                          >
                            {{ $t('send') }}
                          </v-btn>
                          <v-btn
                            v-else
                            ref="botonUpdate"
                            color="secondary"
                            :loading="loading"
                            :disabled="validateForm"
                            @click="handleUpdateTaskTemplate()"
                          >
                            {{ $t('update') }}
                          </v-btn>
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
            <span>{{ $t('editInspectionOption') }}</span>
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
            <span>{{ $t('deleteInspectionOption') }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog
      v-model="dialogDelete"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="elevation-0">
        <v-toolbar color="primary">
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pt-10 pb-10 text-center">
          <span class="text-body-1">
            {{ $t('alertTextTemplate') }}
          </span>
        </v-card-text>

        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            ref="botonCloseInspection"
            class="mr-4"
            color="error"
            outlined
            :disabled="loading"
            @click="closeDelete"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn
            class="mr-4"
            color="secondary"
            :loading="loading"
            @click="deleteItemConfirm"
            >{{ $t('delete') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  name: 'InspectionsOptions',
  data() {
    return {
      newInspectionOption: {
        text: '',
        status: true,
      },
      newInspectionsText: '',
      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('textRequired')],

      headers: [
        {
          text: this.$t('textTemplate'),
          align: 'start',
          width: '30%',
          value: 'text',
        },

        { text: this.$t('active'), value: 'status' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      inspections: [],
      editedIndex: -1,
      editedItem: {
        text: '',
        status: true,
      },
      defaultItem: {
        text: '',
        status: true,
      },

      search: '',
      showSearch: false,
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('newInspectionOptionTemplate')
        : this.$t('editInspectionOptionTemplate')
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
        return !compareItems(this.newInspectionOption, this.defaultItem)
      }
      const propertiesToCheck = ['text', 'status']
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newInspectionOption[p], this.editedItem[p])
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
    this.initializeClients()
  },

  methods: {
    handleFocusBtnActions() {
      if (!this.dialog) {
        return
      }

      setTimeout(() => {
        if (this.editedIndex === -1) {
          this.$refs.botonSave.$el.focus()
        } else if (this.editedIndex !== -1) {
          this.$refs.botonUpdate.$el.focus()
        }
      }, 200)
    },
    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newInspectionTemplateForm) return
      this.$refs.newInspectionTemplateForm.reset()
      this.$nextTick(() => {
        this.newInspectionOption = JSON.parse(JSON.stringify(this.defaultItem))
      })
    },
    async handleAddTaskTemplate() {
      const type = 'inspectionsOptions'
      if (!this.$refs.newInspectionTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          text: this.newInspectionOption.text,
          status: this.newInspectionOption.status || false,
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
      const type = 'inspectionsOptions'
      if (!this.$refs.newInspectionTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          id: this.editedItem.id,
          text: this.newInspectionOption.text,

          status: this.newInspectionOption.status || false,
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
      const _type = 'inspectionsOptions'
      this.loading = true
      try {
        const _inspections = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.inspections =
          _inspections && _inspections.length ? [..._inspections] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    async initializeClients() {
      this.loading = true
      try {
        const _clients = await this.$store.dispatch('admin/orders/get_clients')
        this.clients = _clients && _clients.length ? _clients : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    editItem(item) {
      this.editedIndex = this.inspections.indexOf(item)
      // this.editedItem = Object.assign({}, item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newInspectionOption.text = this.editedItem.text
      this.newInspectionOption.status = this.editedItem.status

      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.inspections.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      // this.$nextTick(() => {
      //   this.$refs.botonCloseInspection.$el.focus()
      // })
      setTimeout(() => {
        this.$refs.botonCloseInspection.$el.focus()
      })
    },
    async deleteItemConfirm() {
      this.loading = true
      const type = 'inspectionsOptions'
      const objectDelete = this.inspections[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type,
        })
        this.loading = false
        this.inspections.splice(this.editedIndex, 1)
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
        Object.assign(this.inspections[this.editedIndex], this.editedItem)
      } else {
        this.inspections.push(this.editedItem)
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
.inspections-options-templates {
  min-width: 60%;
  height: calc(100% - 40px);
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
