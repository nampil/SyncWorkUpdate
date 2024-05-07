<template>
  <div class="items-for-invoices">
    <span class="text-h6">{{ $t('itemsForInvoices') }}</span>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line  -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ml-1"
          color="primary"
          small
          icon
          v-bind="attrs"
          v-on="on"
          @click="handleShowAddItemsForInvoices()"
          ><v-icon>mdi-plus-circle</v-icon></v-btn
        >
      </template>
      <span>{{ $t('addItemsForInvoices') }}</span>
    </v-tooltip>

    <div class="mt-2 mb-2">
      <items-for-invoices-view
        :items="itemsForInvoices"
        :items-for-invoices="itemsForInvoicesTemplates"
        :max-value="maxValue"
        @edit-item="editItemsForInvoices($event)"
        @delete-items="deleteItemsForInvoices($event)"
      ></items-for-invoices-view>
    </div>

    <v-dialog
      v-model="showAddItemsForInvoices"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <add-items-for-invoices
        v-if="showAddItemsForInvoices"
        :items-for-invoices-task="itemsForInvoices"
        :items-for-invoices-bd="itemsForInvoicesTemplates"
        :units="unitsTemplates"
        @update-persistent="validatePersistent = $event"
        @close="showAddItemsForInvoices = false"
        @new-items="addNewItemsForInvoices($event)"
      ></add-items-for-invoices>
    </v-dialog>

    <v-dialog
      v-model="showEditItemForInvoices"
      :overlay="false"
      max-width="700px"
      scrollable
      transition="dialog-transition"
      :persistent="validatePersistent"
    >
      <edit-item-for-invoices
        v-if="showEditItemForInvoices"
        :edited-item="editedItemForInvoices"
        :items-for-invoices-task="itemsForInvoices"
        :items-for-invoices-bd="itemsForInvoicesTemplates"
        :units="unitsTemplates"
        :max-value="maxValue"
        @update-persistent="validatePersistent = $event"
        @update-item="updateItemForInvoices($event)"
        @close="showEditItemForInvoices = false"
      >
      </edit-item-for-invoices>
    </v-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import ItemsForInvoicesView from './ItemsForInvoicesView.vue'
import AddItemsForInvoices from './AddItemsForInvoices.vue'
import EditItemForInvoices from './EditItemForInvoices.vue'
const { mapActions } = createNamespacedHelpers('order')
export default {
  name: 'ItemsForInvoices',
  components: {
    AddItemsForInvoices,
    EditItemForInvoices,
    ItemsForInvoicesView,
  },
  props: {
    order: { type: Object, default: () => ({}) },
    itemsForInvoicesProp: { type: Array, default: () => [] },
    taskId: { type: String, required: true },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
  },
  data() {
    return {
      showAddItemsForInvoices: false,
      validatePersistent: false,
      itemsForInvoices: [],
      units: [],
      editedItemForInvoices: {},
      showEditItemForInvoices: false,
      itemsForInvoicesTemplates: [],
      unitsTemplates: [],
    }
  },
  computed: {
    jobTasksTemplatesInState() {
      return this.$store.state.order.jobTasksTemplatesInState
    },
  },
  watch: {
    itemsForInvoicesProp: {
      handler(val) {
        this.itemsForInvoices = JSON.parse(JSON.stringify(val))
      },
      immediate: true,
      deep: true,
    },
  },

  mounted() {
    if (this.jobTasksTemplatesInState.itemsForInvoices) {
      this.order.client !==
        this.jobTasksTemplatesInState.itemsForInvoices.client ||
      this.order.loanType !==
        this.jobTasksTemplatesInState.itemsForInvoices.loanType
        ? this.getTemplates('itemsForInvoices')
        : (this.itemsForInvoicesTemplates =
            this.jobTasksTemplatesInState.itemsForInvoices.templates)
    }

    if (this.jobTasksTemplatesInState.units) {
      !this.jobTasksTemplatesInState.units.templates ||
      (this.jobTasksTemplatesInState.units.templates &&
        !this.jobTasksTemplatesInState.units.templates.length)
        ? this.getTemplates('units')
        : (this.unitsTemplates = this.jobTasksTemplatesInState.units.templates)
    }
  },

  methods: {
    ...mapActions({
      getTemplatesForOrder: 'get_templatesForOrder',
    }),
    async getTemplates(type) {
      const _type = `${type}Templates`

      this.loading = true
      try {
        const _items = await this.getTemplatesForOrder({
          type,
          order: this.order,
        })
        this[_type] = _items && _items.length ? [..._items] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleShowAddItemsForInvoices() {
      this.showAddItemsForInvoices = !this.showAddItemsForInvoices
    },
    addNewItemsForInvoices(newItemsForInvoices) {
      if (newItemsForInvoices) {
        newItemsForInvoices.forEach((item) => {
          const objectToSend = {
            ...item,
            unit: item.unit.title ? item.unit.title : item.unit,
          }
          this.itemsForInvoices.push(objectToSend)
        })
        this.$emit('update-items-for-invoices', {
          itemsForInvoices: this.itemsForInvoices,
          taskId: this.taskId,
        })
      }
    },
    editItemsForInvoices(itemForInvoices) {
      this.editedItemForInvoices = itemForInvoices
      this.showEditItemForInvoices = true
    },
    updateItemForInvoices(event) {
      const indexOfItem = this.itemsForInvoices
        .map((i) => i.id)
        .indexOf(event.editId)

      if (indexOfItem === -1) return
      this.itemsForInvoices.splice(indexOfItem, 1, event.editedItem)

      this.$emit('update-items-for-invoices', {
        itemsForInvoices: this.itemsForInvoices,
        taskId: this.taskId,
      })
    },
    deleteItemsForInvoices(itemForInvoices) {
      const _index = this.itemsForInvoices
        .map((e) => e.id)
        .indexOf(itemForInvoices.id)

      if (_index === -1) return
      this.itemsForInvoices.splice(_index, 1)

      this.$emit('update-items-for-invoices', {
        itemsForInvoices: this.itemsForInvoices,
        taskId: this.taskId,
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
