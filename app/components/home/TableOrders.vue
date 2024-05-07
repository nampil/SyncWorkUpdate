<template>
  <div class="container-table-orders | h-100 d-flex flex-column">
    <Details-toolbar
      :orders-selected="ordersSelected"
      :headers-default="headersDefault"
      :filters-default="filtersDefault"
      @update-search="search = $event"
      @actions-events="handleActions($event)"
    ></Details-toolbar>
    <div class="table-data-container flex-grow-1 pa-3 pl-6 pr-6">
      <v-card class="elevation-0 h-100 mt-1">
        <v-data-table
          v-model="ordersSelected"
          :headers="headers"
          :items="orders"
          class="orders-table elevation-2 h-100"
          pagination.sync="pagination"
          item-key="id"
          :loading="loadingOrders"
          :search="search"
          dense
          show-select
          fixed-header
          height="90%"
          :footer-props="{
            'items-per-page-options': [15, 25, 30, -1],
          }"
          :options="{
            itemsPerPage: -1,
          }"
          @click:row="handleClickRow"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:item.woNumber="{ item }">
            <v-lazy>
              <div
                :class="[{ 'error pa-1': item.duplicate }]"
                :title="`${item.duplicate ? $t('duplicatedOrder') : ''} ${
                  item.woNumber
                }`"
              >
                {{ item.woNumber }}
              </div>
            </v-lazy>
          </template>
          <!-- eslint-disable-next-line -->
          <template v-slot:item.contractorList="{ item, header }">
            <v-lazy
              :title="item.contractorList.toString()"
              :class="header.cellClass.toString().split(',').join(' ')"
            >
              <span
                >{{
                  item.contractorList.toString() /*$truncate(item.contractorList.toString(), 23) */
                }}
              </span>
            </v-lazy>
          </template>
          <!-- eslint-disable-next-line -->
          <template v-slot:item.category="{ item }">
            <v-lazy>
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-if="item.category"
                    small
                    :color="
                      $getCategoryColor({
                        category: item.category,
                        className: true,
                      })
                    "
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-flag
                  </v-icon>
                </template>
                <span>{{ item.category }}</span>
              </v-tooltip>
            </v-lazy>
          </template>
          <!-- eslint-disable-next-line -->
          <template v-slot:item.fohImg="{ item }">
            <v-lazy>
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="item.fohImg && item.fohImg.url"
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="handleShowImagesSlides(item.fohImg)"
                  >
                    <v-icon small>mdi-image</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('showImage') }}</span>
              </v-tooltip>
            </v-lazy>
          </template>

          <template #item.actions="{ item }">
            <v-lazy>
              <div class="d-flex align-center gap-4">
                <v-menu
                  bottom
                  offset-y
                  offset-x
                  nudge-left="100"
                  :close-on-content-click="false"
                  left
                  offset-overflow
                  class="history-menu"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on: menu, attrs }">
                    <v-tooltip open-delay="600" content-class="small" top>
                      <!-- eslint-disable-next-line -->
                      <template v-slot:activator="{ on: tooltip }">
                        <v-btn
                          id="property-history-btn"
                          icon
                          small
                          color="info"
                          v-bind="attrs"
                          v-on="{ ...tooltip, ...menu }"
                        >
                          <v-icon small>mdi-home-clock-outline</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('showPropertyHistory') }}</span>
                    </v-tooltip>
                  </template>

                  <property-history :order="item"></property-history>
                </v-menu>

                <v-menu
                  bottom
                  offset-y
                  offset-x
                  :close-on-content-click="false"
                  left
                  class="history-menu"
                  max-width="400"
                  min-width="400"
                  max-height="300"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on: menu, attrs }">
                    <v-tooltip open-delay="600" content-class="small" top>
                      <!-- eslint-disable-next-line -->
                      <template v-slot:activator="{ on: tooltip }">
                        <v-btn
                          id="jobNotes-btn"
                          icon
                          small
                          color="info"
                          v-bind="attrs"
                          v-on="{ ...tooltip, ...menu }"
                        >
                          <v-icon small>mdi-notebook</v-icon>
                        </v-btn>
                      </template>
                      <span>Show Job Notes</span>
                    </v-tooltip>
                  </template>

                  <order-job-notes
                    :order-id="item.id"
                    :property-id="item.propertyId"
                  ></order-job-notes>
                </v-menu>
              </div>
            </v-lazy>
          </template>
        </v-data-table>
        <confirm-modal
          :show="showConfirmModal"
          :confirm-btn-text="confirmBtnText"
          :loading="loading"
          :cancel-cb="handleCancelingConfirmModal"
          :confirm-boo="confirmBoo"
          :confirm-cb="
            (confirmBoo) => {
              microEditOrder(confirmBoo)
            }
          "
          :question="confirmQuestion"
        />
      </v-card>
    </div>

    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ text }}
      <!-- eslint-disable-next-line -->
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          {{ $t('close') }}
        </v-btn>
      </template>
    </v-snackbar>
    <assignOrderModal
      :show="showAssignOrderModal"
      :order="orderSelected"
      @close="showAssignOrderModal = false"
      @save="handleAssignOrders"
    />
    <PriorityOrdersModal
      :show="showPriorityOrderModal"
      :order="orderSelected"
      @close="showPriorityOrderModal = false"
      @save="handlePriorityOrders"
    />
    <set-clients-to-orders-modal
      :show="showSetClientToOrdersModal"
      :order-ids="ordersSelected.map((o) => o.id)"
      @close="
        showSetClientToOrdersModal = false
        ordersSelected = []
      "
    />
    <set-status-to-orders-modal
      :show="showSetStatusToOrdersModal"
      :order-ids="ordersSelected.map((order) => order.id)"
      @close="
        showSetStatusToOrdersModal = false
        ordersSelected = []
      "
    />
    <select-contractor
      :show="showSelectContractor"
      @close="showSelectContractor = false"
      @save="handleAssignOrders({ contractors: $event })"
    />

    <select-processor
      :show="showSelectProcessor"
      @close="showSelectProcessor = false"
      @save="handleAssignOrders({ processor: $event })"
    />

    <SlideShow
      :list="listUrl"
      :show="showImagesSlides"
      title="Foh Image"
      type="images"
      @close="showImagesSlides = false"
    />
    <loader-overlay v-if="loading" />
  </div>
</template>

<script>
import OrderJobNotes from '~/components/home/OrderJobNotes.vue'
import PropertyHistory from '~/components/orders/propertyHistory/PropertyHistory.vue'
import ConfirmModal from '~/components/orders/modals/ConfirmModal.vue'
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'
import DetailsToolbar from '~/components/home/DetailsToolbar.vue'
import ordersMicroEdits from '~/mixins/ordersMicroEdits'
import AssignOrderModal from '@/components/orders/modals/AssignOrderModal.vue'
import PriorityOrdersModal from '@/components/orders/modals/PriorityOrdersModal.vue'
import SetClientsToOrdersModal from '@/components/orders/modals/SetClientsToOrdersModal.vue'
import SetStatusToOrdersModal from '@/components/orders/modals/SetStatusToOrdersModal.vue'
import SelectContractor from '@/components/orders/modals/SelectContractor.vue'
import SelectProcessor from '~/components/orders/modals/SelectProcessor.vue'
import SlideShow from '@/components/misc/SlideShow.vue'

import { CATEGORY_OPTIONS } from '@/utils/dictionaries'

export default {
  name: 'TableOrders',
  components: {
    ConfirmModal,
    LoaderOverlay,
    DetailsToolbar,
    AssignOrderModal,
    PriorityOrdersModal,
    SetClientsToOrdersModal,
    SetStatusToOrdersModal,
    SelectContractor,
    SelectProcessor,
    SlideShow,
    PropertyHistory,
    OrderJobNotes,
  },
  mixins: [ordersMicroEdits],

  data() {
    return {
      CATEGORY_OPTIONS: null,
      loadingOrders: false,
      loadingProperties: false,
      loading: false,
      showPropertyHistoryMenu: false,
      showConfirmModal: false,

      confirmBtnText: '',
      confirmBoo: false,
      confirmQuestion: '',
      filters: {},

      snackbar: false,
      text: 'Default filters loaded',
      timeout: 2000,
      showAssignOrderModal: false,
      showPriorityOrderModal: false,
      showSetClientToOrdersModal: false,
      showSetStatusToOrdersModal: false,
      showSelectContractor: false,
      showSelectProcessor: false,
      showImagesSlides: false,
      listUrl: [],
      orderSelected: {},
    }
  },
  computed: {
    ordersSelected: {
      get() {
        return this.$store.state.home.ordersSelected
      },
      set(value) {
        this.$store.commit('home/set_ordersSelected', value)
      },
    },
    search: {
      get() {
        return this.$store.state.home.search
      },
      set(value) {
        this.$store.commit('home/set_search', value)
      },
    },
    user() {
      return this.$store.state.auth.user
    },
    storeFilters() {
      return this.$store.state.auth.user.preferences.ordersFilters
    },
    orderProperties() {
      return this.$store.state.home.orderProperties
    },
    users() {
      return this.$store.state.users.users
    },
    allOrders() {
      return this.$store.state.home.allOrders
    },
    duplicateOrders() {
      return this.allOrders.filter(
        (order) =>
          order.woNumber &&
          this.allOrders.filter((o) => o.woNumber === order.woNumber).length > 1
      )
    },
    orders() {
      const hasHeaderProcessor = this.headers
        .map((header) => header.value)
        .includes('processor')
      const _orders = this.allOrders.map((order) => {
        return {
          ...order,
          ...(hasHeaderProcessor &&
            order.processor && {
              processor: this.users.find((u) => u.uid === order.processor)
                ?.fullName,
            }),
          ...(order.woNumber && {
            duplicate: this.duplicateOrders.some(
              (o) => o.woNumber === order.woNumber
            ),
          }),
        }
      })

      return _orders
    },

    userHeaders() {
      return this.$store.state.auth.user.preferences.headers
    },
    headers() {
      if (this.userHeaders && this.userHeaders.length) {
        const _headers = JSON.parse(JSON.stringify(this.userHeaders))

        _headers.forEach((element) => {
          const _text = element.text.split(' ').join('').toLowerCase()
          element.text = this.$t(_text)
          if (!element.width || !element.width.includes('%')) {
            element.width = '5%'
          }
          if (element.text === 'contractors') {
            element.width = '15%'
            element.cellClass = ['truncate']
          }
          if (element.text === 'Status') {
            element.cellClass = ['truncate']
          }

          element.class = 'header-text ' + `${element.class ?? ''}`
          if (element.text === 'Processor') {
            element.value = 'processorName'
          }
          if (element.text === 'ZIP Code' || element.text === 'Date Received') {
            element.cellClass = []
            element.width = '5%'
            // const indexOfMinWidth =
            //   element.cellClass?.findIndex(
            //     (cellClass) => cellClass === 'min-width'
            //   ) || -1
            // if (indexOfMinWidth > -1) {
            //   element.cellClass.splice(indexOfMinWidth, 1)
            // }
          }

          if (element.text === 'Date Received') {
            element.text = 'Received'
          }
        })

        // add actions column
        _headers.push({
          text: 'Actions',
          value: 'actions',
          align: 'left',
          sortable: false,
          width: '5%',
          class: 'header-text',
        })

        return _headers
      } else {
        return this.headersDefault
      }
    },
    headersDefault() {
      return this.$store.state.home.headersDefault
    },
    filtersDefault() {
      return this.$store.state.home.filtersDefault
    },
    validateFilters() {
      let contador = 0
      if (this.storeFilters === null) {
        return true
      }
      const filters = Object.entries(this.storeFilters)
      if (filters.length === 0) {
        return true
      }
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i]
        const value = filter[1]
        if (value === '') {
          contador++
        }
        if (value === false) {
          contador++
        }
        if (value === null) {
          contador++
        }
        if (Array.isArray(value) && value.length === 0) {
          contador++
        }
      }
      return filters.length === contador
    },
  },
  watch: {
    storeFilters: {
      handler(oldValue) {
        if (oldValue || oldValue === null) {
          this.get_allOrders()
        }
      },
      deep: true,
      // immediate: true,
    },
  },

  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },

  mounted() {
    if (!this.orders.length) {
      this.get_allOrders()
    }
    if (!this.orderProperties.length) {
      this.get_orderProperties()
    }
  },
  methods: {
    async get_allOrders() {
      try {
        this.loadingOrders = true
        await this.$store.dispatch('home/get_allOrders', {
          filters: this.validateFilters
            ? this.filtersDefault
            : this.storeFilters,
          allOrders: this.storeFilters
            ? this.storeFilters.assigned && this.storeFilters.unassigned
            : this.filtersDefault.assigned && this.filtersDefault.unassigned,
        })

        if (this.validateFilters) {
          this.snackbar = true
        }
        this.loadingOrders = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async get_orderProperties() {
      try {
        this.loadingProperties = true

        await this.$store.dispatch('home/get_orderProperties')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loadingProperties = false
      }
    },
    async handleAssignOrders({ contractors, processor }) {
      try {
        this.loading = true
        const promises = []
        let objectToSend = {}
        if (contractors) {
          this.showSelectContractor = false
          objectToSend = {
            contractorsUids: contractors.map((contractor) => contractor.uid),
            contractors,
            assigned: contractors.length > 0,
          }
        }

        if (processor) {
          this.showSelectProcessor = false
          objectToSend = {
            processor: processor.uid,
            processorName: processor.fullName,
          }
        }

        for (let index = 0; index < this.ordersSelected.length; index++) {
          const order = this.ordersSelected[index]
          const promise = this.$store.dispatch('order/update_order', {
            orderId: order.id,
            objectToSend,
          })
          promises.push(promise)
        }
        await Promise.all(promises)
        this.loading = false
        this.ordersSelected = []
        this.$mainAlertSuccess(
          contractors
            ? this.$t('contractorAssigned')
            : 'Success! Procesor Assigned'
        )
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleAssignOrder(item) {
      this.orderSelected = item
      this.showAssignOrderModal = true
    },
    async handlePriorityOrders(priority) {
      this.showPriorityOrderModal = false
      try {
        this.loading = true

        await this.$store.dispatch('orders/set_priority_order', {
          orderIds: this.ordersSelected.map((order) => order.id),
          priority,
        })
        this.loading = false
        this.ordersSelected = []
        this.$mainAlertSuccess(this.$t('categiryOrderSelected'))
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    handleClickRow(item) {
      if (window.getSelection().toString()) {
        return
      }
      this.handleEditOrder(item)
    },
    handleEditOrder(item) {
      this.$router.push(`/dispatching/${item.id}`)
    },

    handleActions(action) {
      if (action === 'set_category') {
        this.showPriorityOrderModal = true
      }
      if (action === 'archive') {
        this.handleArchiveOrder()
      }
      if (action === 'onHold') {
        this.handleSetOnHoldOrder()
      }
      if (action === 'set_client') {
        this.showSetClientToOrdersModal = true
      }
      if (action === 'selectContractors') {
        this.showSelectContractor = true
      }
      if (action === 'set_status') {
        this.showSetStatusToOrdersModal = true
      }
      if (action === 'selectProcessor') {
        this.showSelectProcessor = true
      }
    },
    handleShowImagesSlides(item) {
      this.showImagesSlides = true
      this.$store.commit('home/set_listUrl', item)
    },
  },
}
</script>

<style lang="scss" scoped>
.table-data-container {
  height: calc(100% - 85px);
}

::v-deep.v-data-table--dense > .v-data-table__wrapper > table > tbody > tr > td,
::v-deep.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  width: 1%;
  padding: 0 4px;
  font-size: 0.85rem;
}
::v-deep .truncate {
  max-width: 1px;
  min-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
::v-deep .min-width {
  min-width: 160px;
}

::v-deep .min-width-large {
  min-width: 190px;
}
::v-deep .min-width-small {
  min-width: 95px;
}

::v-deep
  .theme--dark
  .orders-table.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th.header-text {
  color: var(--v-accent-base);
  font-weight: 800;
  text-transform: uppercase;
}
</style>
