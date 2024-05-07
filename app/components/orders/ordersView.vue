<template>
  <v-dialog v-model="dialog" scrollable fullscreen persistent :overlay="false">
    <v-card>
      <v-toolbar color="secondary">
        <v-toolbar-title class="white--text">{{
          $t('addOrdersToMap')
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon color="success" @click="handleSend"
          ><v-icon>mdi-check-circle-outline</v-icon></v-btn
        >
        <v-btn icon color="error" @click="handleClose"
          ><v-icon>mdi-close-circle-outline</v-icon></v-btn
        >
      </v-toolbar>
      <v-card-text class="pt-8" style="flex: 1 1 100%">
        <register-content
          v-if="dialog"
          :in-modal="true"
          :preselected-orders="baseOrders"
          :clean-selection="cleanSelection"
          @orders-selected="handleOrdersSelected"
        />
        <!-- <v-data-table
          v-model="ordersSelected"
          :headers="headers"
          :items="items"
          class="elevation-1"
          pagination.sync="pagination"
          item-key="id"
          :loading="loadingOrders"
          :search="search"
          dense
          show-select
        > -->
        <!-- eslint-disable-next-line -->
        <!-- <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="handleEditOrder(item)">
              mdi-pencil
            </v-icon>
            <v-icon small> mdi-delete </v-icon>
          </template> -->
        <!-- eslint-disable-next-line -->
        <!-- <template v-slot:item.status="{ item }">
          <v-icon
            small
            class="mr-1"
            :color="item.orderNew ? 'green lighten-2' : ''"
          >
            mdi-bookmark
          </v-icon>
          <v-icon
            small
            :color="item.onHold ? 'green lighten-2' : ''"
            @click="handleSetOnHoldOrder(item)"
          >
            mdi-timer
          </v-icon>
          <v-icon
            small
            class="mr-1"
            :color="item.archive ? 'green lighten-2' : ''"
            @click="handleArchiveOrder(item)"
          >
            mdi-archive
          </v-icon>
          <v-icon
            small
            class="mr-1"
            :color="item.edited ? 'green lighten-2' : ''"
          >
            mdi-text-box-edit
          </v-icon>
          <v-icon
            small
            class="mr-1"
            :color="item.assigned ? 'green lighten-2' : ''"
          >
            mdi-account-box-multiple
          </v-icon>
        </template> -->
        <!-- </v-data-table> -->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import RegisterContent from '@/components/orders/RegisterContent.vue'
export default {
  components: {
    RegisterContent,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    baseOrders: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      dialog: false,
      cleanSelection: false,
      localOrdersSelected: [],
      loadingOrders: false,
      search: '',
      cleanSeleccion: false,
    }
  },
  watch: {
    show(val) {
      this.dialog = val
    },
  },
  mounted() {
    this.cleanSeleccion = false
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleOrdersSelected(orders) {
      if (!orders.length) {
        this.cleanSeleccion = false
      }
      this.localOrdersSelected = orders
    },
    handleSend() {
      this.$emit('send', this.localOrdersSelected)
    },
  },
}
</script>

<style lang="scss" scoped></style>
