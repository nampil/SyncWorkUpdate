<template>
  <div class="bids-templates | h-100 pa-3 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="bids"
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
          <v-toolbar-title> Bids Templates</v-toolbar-title>
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
            scrollable
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
                    @click="handleUpdateTaskTemplate()"
                  >
                    {{ $t('update') }}
                  </v-btn>
                </v-toolbar-items>
              </v-toolbar>

              <v-card-text>
                <v-container class="mt-3">
                  <v-form ref="newBid">
                    <v-row>
                      <v-col cols="6">
                        <v-select
                          v-model="newBid.client"
                          :items="clientsFormatted"
                          :label="$t('client')"
                          autofocus
                          outlined
                          clearable
                          :rules="clientRules"
                          hide-details="auto"
                          dense
                          @change="newBid.loanTypes = []"
                        ></v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-select
                          v-model="newBid.loanTypes"
                          :items="loanTypesFormatted"
                          :label="$t('loanType')"
                          outlined
                          multiple
                          clearable
                          :rules="loanTypesRules"
                          validate-on-blur
                          hide-details="auto"
                          dense
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newBid.title"
                          :label="$t('title')"
                          :rules="titleRules"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-textarea
                          v-model="newBid.desc"
                          :label="$t('description')"
                          :rules="descRules"
                          dense
                          hide-details="auto"
                          outlined
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    <v-row
                      v-for="(alternativeTitle, i) in newBid.alternativeTitles"
                      :key="i"
                    >
                      <v-col cols="6">
                        <v-text-field
                          v-model="alternativeTitle.ceTitle"
                          label="CE Title"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model="alternativeTitle.code"
                          label="Code"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>
                      <v-col cols="2">
                        <v-text-field
                          v-model="alternativeTitle.price"
                          label="Price"
                          prefix="$"
                          dense
                          hide-details="auto"
                          outlined
                          @keydown.enter.exact.prevent
                        ></v-text-field>
                      </v-col>
                      <div class="d-flex mt-3">
                        <v-btn
                          v-if="newBid.alternativeTitles.length > 1"
                          color="error"
                          icon
                          @click="handleDeleteAlternativeTitle(i)"
                        >
                          <v-icon>mdi-delete-outline</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="i === newBid.alternativeTitles.length - 1"
                          color="primary"
                          icon
                          @click="handleAddAlternativeTitle"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </v-row>

                    <v-row>
                      <v-col cols="2">
                        <v-text-field
                          v-model="newBid.qty"
                          :label="$t('qty')"
                          outlined
                          dense
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="5">
                        <v-text-field
                          v-model="newBid.contractorPrice"
                          label="Contractor Price"
                          prefix="$"
                          outlined
                          dense
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="5">
                        <v-text-field
                          v-model="newBid.clientPrice"
                          label="Client Price"
                          prefix="$"
                          outlined
                          dense
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="newBid.observations"
                          label="Observations"
                          dense
                          hide-details="auto"
                          outlined
                          rows="2"
                          @keydown.enter.exact.prevent
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
      <template v-slot:item.alternativeTitles="{ item }">
        <div v-for="(title, i) in item.alternativeTitles" :key="i">
          <span>
            CE Title: {{ title.ceTitle }}
            <v-icon small>mdi-arrow-right-thin</v-icon> Code: {{ title.code }}
            <v-icon small>mdi-arrow-right-thin</v-icon>
            Price:
            {{ title.price }}
          </span>
        </div>
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
          <span>Edit Bid</span>
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
          <span>Delete Bid</span>
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
  name: 'BidsComp',
  components: { DialogDelete },

  data() {
    return {
      newBid: {
        title: '',
        desc: '',
        qty: '',
        contractorPrice: '',
        clientPrice: '',

        client: null,
        loanTypes: [],
        alternativeTitles: [{ ceTitle: '', code: '', price: '' }],
        observations: '',
      },
      dialog: false,
      dialogDelete: false,
      loading: false,
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      rulesPrice: [
        (v) => !!v || this.$t('priceRequired'),
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      clientRules: [(v) => !!v || 'Client is required'],
      loanTypesRules: [(v) => !!v.length || this.$t('loanTypesIsRequired')],
      headers: [
        { text: this.$t('title'), value: 'title', width: '10%' },
        {
          text: 'Alternative Titles',
          value: 'alternativeTitles',
        },

        { text: this.$t('client'), value: 'client' },
        { text: this.$t('loanTypes'), value: 'loanTypes' },
        { text: this.$t('description'), value: 'desc', width: '25%' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      bids: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        desc: '',
        qty: '',
        contractorPrice: '',
        clientPrice: '',

        client: null,
        loanTypes: [],
        alternativeTitles: [{ ceTitle: '', code: '', price: '' }],
        observations: '',
      },
      defaultItem: {
        title: '',
        desc: '',
        qty: '',
        contractorPrice: '',
        clientPrice: '',

        client: null,
        loanTypes: [],
        alternativeTitles: [{ ceTitle: '', code: '', price: '' }],
        observations: '',
      },
      search: '',
      showSearch: false,
      clients: [],
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Bid Template' : 'Edit Bid Template'
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
        return !compareItems(this.newBid, this.defaultItem)
      }
      const propertiesToCheck = [
        'desc',
        'title',
        'qty',
        'contractorPrice',
        'clientPrice',

        'client',
        'loanTypes',
        'alternativeTitles',
        'observations',
      ]

      return propertiesToCheck.some((p) => {
        return !compareItems(this.newBid[p], this.editedItem[p])
      })
    },
    clientsFormatted() {
      return this.clients.map((c) => c.title)
    },
    loanTypesFormatted() {
      const indexOf = this.clients
        .map((o) => o.title)
        .indexOf(this.newBid.client)

      if (indexOf > -1) {
        return this.clients[indexOf].loanTypes
      }
      return []
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
    handleCancel() {
      this.cleanUp()
      this.close()
    },
    cleanUp() {
      if (!this.$refs.newBid) return
      this.$refs.newBid.resetValidation()
      this.$nextTick(() => {
        this.newBid = JSON.parse(JSON.stringify(this.defaultItem))
      })
    },
    async handleAddTaskTemplate() {
      if (!this.$refs.newBid.validate()) {
        return
      }

      this.loading = true
      try {
        const objectToSend = {
          ...this.newBid,
        }
        await this.$store.dispatch(`admin/orders/add_task_templates`, {
          objectToSend,
          type: 'bids',
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
      if (!this.$refs.newBid.validate()) {
        return
      }
      if (this.validateForm) {
        this.$mainAlertInfo('There are no changes to update')
        return
      }
      this.loading = true
      try {
        const objectToSend = {
          ...this.newBid,
          id: this.editedItem.id,
        }

        await this.$store.dispatch(`admin/orders/update_task_template`, {
          objectToSend,
          type: 'bids',
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
      const _type = 'bids'
      this.loading = true
      try {
        const _items = await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        this.bids = _items && _items.length ? [..._items] : []
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
      this.editedIndex = this.bids.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newBid.title = this.editedItem.title
      this.newBid.desc = this.editedItem.desc
      this.newBid.contractorPrice = this.editedItem.contractorPrice || ''
      this.newBid.clientPrice = this.editedItem.clientPrice || ''
      this.newBid.qty = this.editedItem.qty || ''
      this.newBid.client = this.editedItem.client || ''
      this.newBid.loanTypes = this.editedItem.loanTypes || ''
      this.newBid.alternativeTitles = JSON.parse(
        JSON.stringify(this.editedItem.alternativeTitles)
      )
      this.newBid.observations = this.editedItem.observations || ''
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.bids.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      this.loading = true
      const objectDelete = this.bids[this.editedIndex]
      try {
        await this.$store.dispatch('admin/orders/delete_task_template', {
          objectDelete,
          type: 'bids',
        })
        this.loading = false
        this.bids.splice(this.editedIndex, 1)
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
      this.$refs.newBid.resetValidation()
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
        Object.assign(this.bids[this.editedIndex], this.editedItem)
      } else {
        this.bids.push(this.editedItem)
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
    handleAddAlternativeTitle() {
      this.newBid.alternativeTitles.push({
        ceTitle: '',
        code: '',
        price: '',
      })
    },
    handleDeleteAlternativeTitle(i) {
      this.newBid.alternativeTitles.splice(i, 1)
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
