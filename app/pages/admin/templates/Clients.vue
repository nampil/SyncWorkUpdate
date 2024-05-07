<template>
  <div class="clients-templates | h-100 pa-3 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="clients"
      sort-by="calories"
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
          <v-toolbar-title>{{ $t('clientsTemplates') }}</v-toolbar-title>
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
                <v-toolbar-items>
                  <v-btn
                    v-if="editedIndex === -1"
                    ref="botonSave"
                    text
                    :loading="loading"
                    @click="handleAddClientTemplate()"
                  >
                    {{ $t('send') }}
                  </v-btn>
                  <v-btn
                    v-else
                    ref="botonUpdate"
                    text
                    :loading="loading"
                    :disabled="validateForm"
                    @click="handleUpdateClientTemplate()"
                  >
                    {{ $t('update') }}
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-card-text>
                <v-container class="mt-3">
                  <v-form ref="clientTemplateForm">
                    <v-row>
                      <v-col cols="5">
                        <v-text-field
                          v-model="newClient.title"
                          :label="$t('client')"
                          dense
                          :rules="clientRules"
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>

                      <v-col cols="5">
                        <v-combobox
                          v-model="newLoanTypes"
                          hide-selected
                          :label="$t('loanTypes')"
                          multiple
                          small-chips
                          :rules="loanTypesRules"
                          outlined
                          dense
                        >
                          <!-- eslint-disable -->
                          <template
                            v-slot:selection="{ attrs, item, parent, selected }"
                          >
                            <!-- eslint-enable -->
                            <v-chip
                              v-if="item === Object(item)"
                              class="mt-1"
                              v-bind="attrs"
                              :input-value="selected"
                              small
                            >
                              <span class="pr-2">
                                {{ item.text }}
                              </span>
                              <v-icon small @click="parent.selectItem(item)">
                                $delete
                              </v-icon>
                            </v-chip>
                          </template>
                        </v-combobox>
                      </v-col>
                      <v-col cols="2">
                        <v-text-field
                          v-model="newClient.discount"
                          label="Discount"
                          prefix="%"
                          outlined
                          dense
                          @blur="validateDiscount"
                        ></v-text-field>
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
          <span>{{ $t('editClient') }}</span>
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
          <span>{{ $t('deleteClient') }}</span>
        </v-tooltip>
      </template>
      <!-- eslint-disable-next-line -->
      <template v-slot:item.loanTypes="{ item }">
        <span v-for="(loanType, i) in item.loanTypes" :key="loanType"
          >{{ loanType }}{{ i === item.loanTypes.length - 1 ? '.' : ', ' }}
        </span>
      </template>
    </v-data-table>

    <DialogDelete
      :show="dialogDelete"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm"
    />
  </div>
</template>

<script>
import DialogDelete from '../../../components/admin/templates/dialogs/DialogDelete'
export default {
  name: 'ClientsComp',
  components: { DialogDelete },

  data() {
    return {
      newClient: {
        title: '',
        loanTypes: [],
        discount: '',
      },
      newLoanTypes: [],
      dialog: false,
      dialogDelete: false,
      loading: false,
      clientRules: [(v) => !!v || this.$t('clientIsRequired')],
      loanTypesRules: [(v) => !!v.length || this.$t('loanTypesIsRequired')],
      headers: [
        { text: this.$t('client'), value: 'title' },
        { text: this.$t('loanTypes'), value: 'loanTypes' },
        { text: 'Discount', value: 'discount' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      clients: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        loanTypes: [],
        discount: '',
      },
      defaultItem: {
        title: '',
        loanTypes: [],
        discount: '',
      },
      search: '',
      showSearch: false,
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('newClientTemplate')
        : this.$t('editClientTemplate')
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
        return !compareItems(this.newClient, this.defaultItem)
      }
      const propertiesToCheck = ['title', 'loanTypes', 'discount']

      return propertiesToCheck.some((p) => {
        return !compareItems(this.newClient[p], this.editedItem[p])
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
    newLoanTypes(val, prev) {
      if (val.length === prev.length) return

      this.newLoanTypes = val.map((v) => {
        if (typeof v === 'string') {
          v = {
            text: v,
          }
        }
        return v
      })
      this.newClient.loanTypes = this.newLoanTypes.map((l) => l.text)
    },
  },

  created() {
    this.initialize()
  },

  methods: {
    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.clientTemplateForm.$el[index].focus()
      })
    },
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
      if (!this.$refs.clientTemplateForm) return
      this.$refs.clientTemplateForm.resetValidation()
      this.$nextTick(() => {
        this.newClient = Object.assign({}, this.defaultItem)
        this.newLoanTypes = []
      })
    },

    async handleAddClientTemplate() {
      if (!this.$refs.clientTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          title: this.newClient.title,
          loanTypes: this.newClient.loanTypes,
          discount: this.newClient.discount,
        }
        await this.$store.dispatch(`admin/orders/add_client_templates`, {
          objectToSend,
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
    async handleUpdateClientTemplate() {
      if (!this.$refs.clientTemplateForm.validate()) {
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          id: this.editedItem.id,
          title: this.newClient.title,
          loanTypes: this.newClient.loanTypes,
          discount: this.newClient.discount,
        }
        await this.$store.dispatch(`admin/orders/update_client_template`, {
          objectToSend,
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
      this.editedIndex = this.clients.indexOf(item)
      // this.editedItem = Object.assign({}, item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newClient.title = this.editedItem.title
      this.newLoanTypes = this.editedItem.loanTypes
      this.newClient.discount = this.editedItem.discount || ''
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.clients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      setTimeout(() => {
        this.$refs.botonCloseDelete.$el.focus()
      })
    },

    async deleteItemConfirm() {
      this.loading = true
      const objectDelete = this.clients[this.editedIndex]

      try {
        await this.$store.dispatch('admin/orders/delete_client_template', {
          objectDelete,
        })
        this.loading = false
        this.clients.splice(this.editedIndex, 1)
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
        Object.assign(this.clients[this.editedIndex], this.editedItem)
      } else {
        this.clients.push(this.editedItem)
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
    validateDiscount() {
      if (!isNaN(this.newClient.discount) && this.newClient.discount) {
        if (this.newClient.discount > 100) {
          this.newClient.discount = 100.0
        } else {
          this.newClient.discount =
            this.newClient.discount < 0
              ? (parseFloat(this.newClient.discount) * -1).toFixed(2)
              : parseFloat(this.newClient.discount).toFixed(2)
          this.newClient.discount = parseFloat(this.newClient.discount)
        }
      } else {
        this.newClient.discount = ''
      }
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
