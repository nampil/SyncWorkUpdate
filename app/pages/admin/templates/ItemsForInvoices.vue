<template>
  <div class="items-for-invoices-templates | pa-3 h-100 overflow-y-auto">
    <v-data-table
      :headers="headers"
      :items="itemsForInvoices"
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
          <v-toolbar-title>
            {{ $t('itemsForInvoicesTemplates') }}</v-toolbar-title
          >
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

          <v-btn
            small
            color="primary"
            dark
            @click="handleShowAddItemForInvoice"
          >
            {{ $t('add') }}
          </v-btn>
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
          <span>{{ $t('editItemForInvoice') }}</span>
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
          <span>{{ $t('deleteItemForInvoice') }}</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <AddItemForInvoice
      :show="showAddItemForInvoiceModal"
      :item-to-edit="editedItem"
      :form-title="formTitle"
      @close="handleClose"
    />

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
import AddItemForInvoice from './AddItemForInvoice.vue'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export default {
  name: 'ItemsForInvoicesComp',
  components: { DialogDelete, AddItemForInvoice },

  data() {
    return {
      newItemsForInvoices: [],
      showAddItemForInvoiceModal: false,
      // dialog: false,
      dialogDelete: false,
      loading: false,

      headers: [
        {
          text: this.$t('title'),
          align: 'start',
          width: '20%',
          value: 'title',
        },

        { text: this.$t('unit'), value: 'unit' },
        { text: this.$t('price'), value: 'price' },
        { text: this.$t('client'), value: 'client' },
        { text: this.$t('loanTypes'), value: 'loanTypes' },
        { text: this.$t('active'), value: 'active' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],

      editedIndex: -1,
      editedItem:
        // {
        //   title: '',
        //   desc: '',
        //   price: '',
        //   active: true,
        //   unit: '',
        //   client: '',
        //   loanTypes: [],
        // }
        null,
      defaultItem: {
        title: '',
        desc: '',
        price: '',
        active: true,
        unit: '',
        client: '',
        loanTypes: [],
      },
      clients: [],
      workToDos: [],
      units: [],
      search: '',
      showSearch: false,
    }
  },

  computed: {
    itemsForInvoices() {
      return this.$store.state.admin.itemForInvoiceTemplates
        .itemForInvoiceTemplates
    },

    formTitle() {
      return this.editedIndex === -1
        ? this.$t('newItemTemplate')
        : this.$t('editItemTemplate')
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
        return !compareItems(this.newItemsForInvoices, this.defaultItem)
      }
      const propertiesToCheck = [
        'client',
        'price',
        'unit',
        'loanTypes',
        'desc',
        'title',
        'active',
      ]
      return propertiesToCheck.some((p) => {
        return !compareItems(this.newItemsForInvoices[p], this.editedItem[p])
      })
    },
  },

  watch: {
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  created() {
    this.initialize()
    // this.initializeClients()
    // this.initializeUnits()
  },

  methods: {
    handleShowAddItemForInvoice() {
      this.showAddItemForInvoiceModal = true
    },

    async initialize() {
      const _type = TEMPLATES_TYPES.itemsForInvoices
      this.loading = true
      try {
        /* const _items = */ await this.$store.dispatch(
          'admin/orders/get_tasks_templates',
          _type
        )
        // this.itemsForInvoices = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    async editItem(item) {
      try {
        this.loading = true

        const title = item.title

        const alllRelativeItems = await this.$store.dispatch(
          'admin/itemForInvoiceTemplates/get_relativeItems',
          title
        )

        if (alllRelativeItems?.length) {
          this.editedItem = {
            id: item.id,
            workTemplateId: item.workTemplateId,
            title: item.title,
            prices: alllRelativeItems.map((i) => ({
              price: i.price,
              client: i.client,
              loanTypes: i.loanTypes,
              id: i.id,
            })),
            desc: item.desc,
            active: item.active,
            unit: item.unit,
          }
          this.editedIndex = this.itemsForInvoices.indexOf(item)
          this.showAddItemForInvoiceModal = true
          return
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },

    deleteItem(item) {
      this.editedIndex = this.itemsForInvoices.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      try {
        this.loading = true

        const objectDelete = this.itemsForInvoices[this.editedIndex]

        await this.$store.dispatch(
          'admin/itemForInvoiceTemplates/delete_itemForInvoiceTemplate',
          {
            objectDelete,
          }
        )

        this.loading = false
        // this.itemsForInvoices.splice(this.editedIndex, 1)
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

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
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
    handleClose() {
      this.$nextTick(() => {
        this.editedItem = null
        this.editedIndex = -1
      })
      this.showAddItemForInvoiceModal = false
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
:v-deep.v-data-table--dense > .v-data-table__wrapper {
  overflow-y: hidden;
}
</style>
