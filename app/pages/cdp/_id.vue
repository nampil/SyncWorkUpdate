<template>
  <div v-if="order" class="order-detail h-100">
    <order-details-toolbar
      :order="order"
      :show-history="showHistory"
      :show-job-notes-drawer="showJobNotesDrawer"
      :from-oos="false"
      @toggle-job-notes-drawer="handleToggleDrawers('jobNotesDrawer', true)"
      @toggle-show-history="showHistory = !showHistory"
      @order-edited-changed="handleOrderEdited"
      @toggle-show-note-pad="handleShowNotePad"
    />

    <div class="content-tabs | d-flex flex-column">
      <div class="tabs-wrapper | flex-grow-0">
        <v-tabs
          v-model="tab"
          background-color="primary"
          fixed-tabs
          center-active
        >
          <v-tab v-for="item in items" :key="item.title">{{
            $t(item.title)
          }}</v-tab>
        </v-tabs>
      </div>
      <div class="tab-items-wrapper | flex-grow-1">
        <v-tabs-items v-model="tab" class="h-100">
          <v-tab-item class="h-100">
            <v-container fluid class="scrollArea">
              <general-info
                v-if="order && order.id"
                :order="order"
                :show-note-pad="showNotePad"
                :closing-notes="closingNotes"
                @close-note-pad="handleShowNotePad"
              />
              <loader-overlay v-else />
            </v-container>
          </v-tab-item>

          <v-tab-item class="h-100">
            <v-container fluid class="scrollArea">
              <invoices v-if="order && order.id" :order="order"> </invoices>
            </v-container>
          </v-tab-item>

          <v-tab-item class="h-100">
            <v-container fluid class="scrollArea">
              <bids v-if="tab && order && order.id" :order="order"> </bids>
            </v-container>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </div>
    <job-notes-drawer
      :order="order"
      :show="showJobNotesDrawer"
      class="job-notes-drawer"
    ></job-notes-drawer>
    <loader-overlay v-if="loading" />
    <v-expand-transition>
      <order-history
        v-if="showHistory"
        :order="generalInfo"
        @close="showHistory = false"
      />
    </v-expand-transition>

    <Lupa />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import OrderDetailsToolbar from '../../components/orders/OrderDetailsToolbar.vue'
import LoaderOverlay from '@/components/misc/LoaderOverlay.vue'
import GeneralInfo from '@/components/orders/GeneralInfo.vue'
import Invoices from '@/components/orders/invoices/InvoiCes.vue'
import Bids from '@/components/orders/bids/Bids.vue'
import OrderHistory from '@/components/orders/orderHistory/OrderHistory.vue'
import JobNotesDrawer from '~/components/orders/jobNotes/JobNotesDrawer.vue'
import Lupa from '~/components/misc/Lupa.vue'
import { ORDER_STATUS } from '@/utils/dictionaries'

export default {
  name: 'OrderDetails',
  components: {
    OrderDetailsToolbar,
    Lupa,
    LoaderOverlay,
    GeneralInfo,
    Invoices,
    OrderHistory,
    JobNotesDrawer,
    Bids,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name && from.name.includes('cdp')) {
      next((vm) => {})
    } else {
      const { id } = to.params
      next(`/dispatching/${id}`)
    }
  },
  layout: 'dash',

  data() {
    return {
      loading: false,
      showHistory: false,
      tab: null,
      items: [
        { title: 'generalInfo' },
        { title: 'invoice' },
        { title: 'bids' },
      ],
      orderdEdited: false,
      showNotePad: false,
      closingNotes: false,
      ORDER_STATUS: null,
    }
  },
  head() {
    return {
      title: this.$t('orderDetail'),
    }
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      generalInfo: (state) => state.order.order,
      inspections: (state) => state.order.inspections,
      allowables: (state) => state.order.allowables,
      allowablesPools: (state) => state.order.allowablesPools,
      workToDos: (state) => state.order.workToDos,
      appointments: (state) => state.order.appointments,
      instructions: (state) => state.order.instructions,
    }),
    order() {
      return {
        ...this.generalInfo,
        inspections: this.inspections
          .map((inspection) => inspection)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          }),
        allowables: this.allowables
          .map((allowable) => allowable)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          }),
        allowablesPools: this.allowablesPools
          .map((allowable) => allowable)
          .sort((a, b) => {
            if (a.position && b.position) {
              return a.position > b.position ? 1 : -1
            }
            return a.createdAt > b.createdAt ? 1 : -1
          }),
        workToDos: this.workToDos
          .map((workToDo) => workToDo)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          }),
        appointments: this.appointments
          .map((appointment) => appointment)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          }),
        instructions: this.instructions
          .map((instruction) => instruction)
          .sort((a, b) => {
            return a.position > b.position ? 1 : -1
          }),
      }
    },
    selectOrder() {
      return this.$store.state.oos.routes.selectOrder
    },
    showJobNotesDrawer: {
      get() {
        return this.$store.state.order.showJobNotesDrawer
      },
      set(val) {
        this.$store.commit('order/set_showJobNotesDrawer', val)
      },
    },
    showPropertyHistoryDrawer: {
      get() {
        return this.$store.state.order.showPropertyHistoryDrawer
      },
      set(val) {
        this.$store.commit('order/set_showPropertyHistoryDrawer', val)
      },
    },
  },
  watch: {
    $route(newVal, oldVal) {
      if (newVal.params.id !== this.order.id) {
        this.getOrder()
      }
    },
    order(value) {
      this.orderdEdited = value.edited
    },
    selectOrder(newVal) {
      if (this.$route.params.id === newVal) {
        this.getOrder()
      }
    },
  },

  created() {
    this.ORDER_STATUS = ORDER_STATUS
  },

  mounted() {
    if (this.selectOrder) {
      this.getOrder()
    }
  },

  beforeDestroy() {
    this.$store.dispatch('order/flush_state')
    this.$store.commit('invoice/flush_invoice')
  },

  methods: {
    handleShowNotePad() {
      this.showNotePad = !this.showNotePad
    },
    handleToggleDrawers(drawer, toggle) {
      switch (drawer) {
        case 'jobNotesDrawer':
          this.showPropertyHistoryDrawer = false
          this.showJobNotesDrawer = toggle ? !this.showJobNotesDrawer : true
          break
        case 'showPropertyHistoryDrawer':
          this.showJobNotesDrawer = false
          this.showPropertyHistoryDrawer = toggle
            ? !this.showPropertyHistoryDrawer
            : true
          break
        default:
          this.showJobNotesDrawer = false
          this.showPropertyHistoryDrawer = false
          break
      }
    },
    async getOrder() {
      // this.$store.dispatch('order/flush_state')
      try {
        this.loading = true
        await this.$store.dispatch('order/get_order', {
          orderId: this.$route.params.id,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error feching order: ', error)
        this.$mainAlertError(this.$t('oopsProblemOrder'))
      } finally {
        this.loading = false
      }
    },

    handleOrderEdited(value) {
      this.updateOrder({ edited: value })
    },
    async updateOrder(objectToSend) {
      try {
        this.loading = true
        await this.$store.dispatch('order/update_order', {
          orderId: this.order.id,
          objectToSend,
        })
        this.loading = false
        this.$mainAlertSuccess(
          `${this.$t('orderMarked')} ${
            this.orderdEdited ? this.$t('orderEdited') : this.$t('orderNotEdit')
          }`
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.order-detail {
  display: grid;
  grid-template-areas: 'header drawer' 'content-tabs drawer';
  grid-template-columns: 1fr auto;
  grid-template-rows: min-content 1fr;
}
.content-toolbar {
  grid-area: header;
}
.content-tabs {
  grid-area: content-tabs;
}
</style>
