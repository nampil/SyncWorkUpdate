<template>
  <div class="register-content d-flex flex-column">
    <div
      class="action-container d-flex flex-wrap align-center justify-md-between mb-4"
    >
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="!inModal"
            class="mr-4"
            icon
            color="primary"
            nuxt
            to="/dispatching/add-orders"
            v-bind="attrs"
            v-on="on"
            ><v-icon>mdi-plus-circle-outline</v-icon></v-btn
          >
        </template>
        <span>{{ $t('addOrders') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="!inModal"
            class="mr-4"
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="handleSeeInMapBtn"
            ><v-icon>mdi-map-marker-right-outline</v-icon></v-btn
          >
        </template>
        <span>{{ $t('routes') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="!inModal"
            class="mr-4"
            icon
            color="primary"
            :disabled="!ordersSelected.length"
            v-bind="attrs"
            v-on="on"
            @click="showSelectContractor = true"
            ><v-icon>mdi-account-box-multiple-outline</v-icon></v-btn
          >
        </template>
        <span>{{ $t('selectContractor(s)') }}</span>
      </v-tooltip>

      <v-menu
        v-if="!inModal"
        bottom
        :disabled="!ordersSelected.length"
        offset-y
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                color="primary"
                class="mr-4"
                icon
                :disabled="!ordersSelected.length"
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('actions') }}</span>
          </v-tooltip>
        </template>

        <v-list>
          <v-list-item @click="handleArchiveOrder()">
            <v-list-item-icon>
              <v-icon>mdi-archive</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{
              ordersSelected.length && !ordersSelected[0].archive
                ? $t('Archive')
                : $t('Unarchive')
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleSetOnHoldOrder()">
            <v-list-item-icon>
              <v-icon>mdi-timer</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{
              ordersSelected.length && !ordersSelected[0].onHold
                ? $t('SetOn-hold')
                : $t('RemoveOn-hold')
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleSetPriorityOrder()">
            <v-list-item-icon>
              <v-icon>mdi-flag</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('setCategory') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleSetClientToOrders()">
            <v-list-item-icon>
              <v-icon>mdi-account-tie-hat</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('setClient') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            color="primary"
            :ripple="false"
            v-bind="attrs"
            v-on="on"
            @click="handleSearch"
          >
            <v-icon>{{ openSearch ? 'mdi-close' : 'mdi-magnify' }}</v-icon>
          </v-btn>
        </template>
        <span>{{ !openSearch ? $t('search') : $t('close') }}</span>
      </v-tooltip>
      <div :class="['search-box d-flex', { open: openSearch }]">
        <v-slide-x-transition>
          <v-text-field
            v-show="openSearch"
            ref="searchInput"
            v-model="search"
            class="search-input ma-0"
            dense
            outlined
            :placeholder="$t('search')"
            hide-details="auto"
          ></v-text-field>
        </v-slide-x-transition>
      </div>

      <v-spacer></v-spacer>
      <div class="mr-4">
        <button
          :class="['sqr-btn  rounded', { 'primary active': totalEntries }]"
          @click="handleTotalEntriesBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">{{ $t('totalEntries') }}</div>
            <div class="text-h6">{{ counts.totalEntriesCount }}</div>
          </div>
        </button>
      </div>
      <div class="mr-4">
        <button
          :class="['sqr-btn  rounded', { 'primary active': orderNew }]"
          @click="handleOrderNewBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">{{ $t('newOrders') }}</div>
            <div class="text-h6">{{ counts.orderNewCount }}</div>
          </div>
        </button>
        <button
          :class="['sqr-btn  rounded', { 'primary active': onHold }]"
          @click="handleOnHoldBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">{{ $t('onHold') }}</div>
            <div class="text-h6">{{ counts.onHoldCount }}</div>
          </div>
        </button>
      </div>
      <div class="mr-4">
        <button
          :class="['sqr-btn  rounded', { 'primary active': assigned }]"
          @click="handleAssignedBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">{{ $t('assigned') }}</div>
            <div class="text-h6">{{ counts.assignedCount }}</div>
          </div>
        </button>
        <button
          :class="['sqr-btn  rounded', { 'primary active': unassigned }]"
          @click="handleUnassignedBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">{{ $t('unassigned') }}</div>
            <div class="text-h6">{{ counts.unassignedCount }}</div>
          </div>
        </button>
      </div>
      <div class="mr-4">
        <button
          :class="['sqr-btn  rounded', { 'primary active': edited }]"
          @click="handleEditedBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">{{ $t('edited') }}</div>
            <div class="text-h6">{{ counts.editedCount }}</div>
          </div>
        </button>
      </div>
      <!-- <div class="mr-4">
        <button
          :class="['sqr-btn  rounded', { 'primary active': archived }]"
          @click="handleArchivedBtn"
        >
          <div class="d-flex flex-column">
            <div class="btn-title">Archived</div>
            <div class="text-h6">{{ counts.archived }}</div>
          </div>
        </button>
      </div> -->
    </div>

    <div class="meta-info mb-2">
      <v-row justify="space-between">
        <v-col cols="6">
          <span v-if="ordersSelected.length"
            >{{ $t('selected') }} {{ ordersSelected.length }}</span
          ></v-col
        >
        <v-col cols="6" class="d-flex justify-end">
          <div class="mr-6">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="red darken-1"
                  :class="[
                    'flag-icon mr-2',
                    { active: filterPriority === 'Ultra High' },
                  ]"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleFilterPriority('Ultra High')"
                  >mdi-flag</v-icon
                >
              </template>
              <span>Ultra High Orders</span>
            </v-tooltip>
            <span>{{ itemsUltraHighPriority.length }}</span>
          </div>
          <div class="mr-6">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="orange darken-1"
                  :class="[
                    'flag-icon mr-2',
                    { active: filterPriority === 'High' },
                  ]"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleFilterPriority('High')"
                  >mdi-flag</v-icon
                >
              </template>
              <span>Higt Orders</span>
            </v-tooltip>
            <span>{{ itemsHighPriority.length }}</span>
          </div>
          <div class="mr-6">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="yellow darken-1"
                  :class="[
                    'flag-icon mr-2',
                    { active: filterPriority === 'Median' },
                  ]"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleFilterPriority('Median')"
                  >mdi-flag</v-icon
                >
              </template>
              <span>Median Orders</span>
            </v-tooltip>
            <span>{{ itemsMedianPriority.length }}</span>
          </div>
          <div class="mr-6">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="green darken-1"
                  :class="[
                    'flag-icon mr-2',
                    { active: filterPriority === 'Low' },
                  ]"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleFilterPriority('Low')"
                  >mdi-flag</v-icon
                >
              </template>
              <span>Low Orders</span>
            </v-tooltip>
            <span>{{ itemsLowPriority.length }}</span>
          </div>
          <div class="mr-6">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="blue lighten-1"
                  :class="[
                    'flag-icon mr-2',
                    { active: filterPriority === 'Very Low' },
                  ]"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleFilterPriority('Very Low')"
                  >mdi-flag</v-icon
                >
              </template>
              <span>Very Low Orders</span>
            </v-tooltip>
            <span>{{ itemsVeryLowPriority.length }}</span>
          </div>
        </v-col>
      </v-row>
    </div>

    <div class="table-data-container flex-grow-1">
      <v-card class="elevation-0 h-100">
        <v-data-table
          v-model="ordersSelected"
          :headers="headers"
          :items="items"
          class="orders-table elevation-1 h-100"
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
          <template v-slot:item.actions="{ item }">
            <v-lazy>
              <table-action-item
                :item="item"
                @set-on-hold="handleSetOnHoldOrder(item)"
                @assig-order="handleAssignOrder(item)"
                @edit-order="handleEditOrder(item)"
                @archive-order="handleArchiveOrder(item)"
                @priority-order="handlePriorityOrder($event, item)"
              />
            </v-lazy>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.category="{ item }">
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-lazy>
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
                </v-lazy>
              </template>
              <span>{{ item.category }}</span>
            </v-tooltip>
          </template>
          <!-- eslint-disable-next-line -->
          <template v-slot:item.fohImg="{ item }">
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
          </template>
          <!-- eslint-disable-next-line -->
          <!-- <template v-slot:item.processor="{ item }">
            {{ users.find((u) => u.uid === item.processor)?.fullName }}
          </template> -->
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

    <set-clients-to-orders-modal
      :show="showSetClientToOrdersModal"
      :order-ids="ordersSelected.map((o) => o.id)"
      @close="
        showSetClientToOrdersModal = false
        ordersSelected = []
      "
    />
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
    <select-contractor
      :show="showSelectContractor"
      @close="showSelectContractor = false"
      @save="handleAssignOrders"
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
import ConfirmModal from '@/components/orders/modals/ConfirmModal.vue'
import SelectContractor from '@/components/orders/modals/SelectContractor.vue'
import AssignOrderModal from '@/components/orders/modals/AssignOrderModal.vue'
import LoaderOverlay from '@/components/misc/LoaderOverlay.vue'
import PriorityOrdersModal from '@/components/orders/modals/PriorityOrdersModal.vue'
import TableActionItem from '@/components/orders/TableActionItem.vue'
import SetClientsToOrdersModal from '@/components/orders/modals/SetClientsToOrdersModal.vue'
import ordersMicroEdits from '@/mixins/ordersMicroEdits'
import orderFilter from '@/mixins/orderFilter'
import SlideShow from '~/components/misc/SlideShow.vue'
import { CATEGORY_OPTIONS } from '@/utils/dictionaries'

export default {
  name: 'RegisterContent',
  components: {
    ConfirmModal,
    AssignOrderModal,
    SelectContractor,
    LoaderOverlay,
    TableActionItem,
    PriorityOrdersModal,
    SetClientsToOrdersModal,
    SlideShow,
  },
  mixins: [ordersMicroEdits, orderFilter],
  props: {
    inModal: { type: Boolean, default: false },
    preselectedOrders: { type: Array, default: () => [] },
    cleanSelection: { type: Boolean, default: false },
  },
  data() {
    return {
      showSetClientToOrdersModal: false,
      showPriorityOrderModal: false,
      showAssignOrderModal: false,
      showSelectContractor: false,
      ordersSelected: [],
      orderSelected: {},
      confirmQuestion: '',
      confirmBtnText: '',
      confirmBoo: false,
      showConfirmModal: false,
      microEditType: '',
      search: '',
      loadingOrders: false,
      loading: false,
      openSearch: false,
      showImagesSlides: false,
      listUrl: [],
      CATEGORY_OPTIONS: null,
    }
  },
  computed: {
    isAuth() {
      return this.$store.getters['auth/isAuth']
    },
    userHeaders() {
      return this.$store.state.auth.user.preferences.headers
    },
    users() {
      return this.$store.state.users.users
    },
    headers() {
      const actions = {
        text: 'actions',
        value: 'actions',
        sortable: false,
        width: '12%',
        align: 'center',
        cellClass: ['min-width-large'],
      }
      if (this.userHeaders && this.userHeaders.length) {
        const headers = !this.inModal
          ? [...this.userHeaders, actions]
          : this.userHeaders
        const _headers = JSON.parse(JSON.stringify(headers))
        _headers.forEach((element) => {
          const _text = element.text.split(' ').join('').toLowerCase()
          element.text = this.$t(_text)
        })
        return _headers
      } else {
        return this.headersDefault
      }
    },
    headersDefault() {
      const actions = {
        text: this.$t('actions'),
        value: 'actions',
        sortable: false,
        width: '12%',
        align: 'center',
        cellClass: ['min-width-large'],
      }
      const headers = [
        {
          text: this.$t('wo#'),
          value: 'woNumber',
          width: '10%',
          align: 'left',
          sortable: true,
        },
        {
          text: this.$t('duedate'),
          value: 'dateDueFormatted',
          width: '10%',
          align: 'center',
          cellClass: ['min-width-large'],
          sortable: true,
          // sort: (a, b) => {
          //   const [aMonth, aDay, aYear] = a.split('-')
          //   const [bMonth, bDay, bYear] = b.split('-')
          //   const aTimestamp = new Date(aYear, aMonth - 1, aDay)
          //   const bTimestamp = new Date(bYear, bMonth - 1, bDay)
          //   if (aTimestamp < bTimestamp) {
          //     return -1
          //   } else if (aTimestamp > bTimestamp) {
          //     return 1
          //   } else return 0
          // },
        },
        {
          text: this.$t('address'),
          value: 'address',
          width: '15%',
          align: 'left',
          cellClass: ['truncate'],
          sortable: true,
        },
        {
          text: this.$t('city'),
          value: 'city',
          width: '15%',
          align: 'left',
          cellClass: ['min-width-small'],
          sortable: true,
        },
        {
          text: this.$t('zip'),
          value: 'zip',
          width: '15%',
          align: 'center',
          cellClass: ['min-width'],
          sortable: true,
        },
        {
          text: this.$t('worktype'),
          value: 'workType',
          width: '10%',
          align: 'left',
          cellClass: ['truncate'],
          sortable: true,
        },
        {
          text: this.$t('contractors'),
          value: 'contractorList',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: this.$t('status'),
          value: 'status',
          width: '10%',
          align: 'center',
          cellClass: ['truncate'],
          sortable: true,
        },
      ]
      if (!this.inModal) {
        headers.push(actions)
      }
      return headers
    },
    counts() {
      const totalEntriesCount = this.$store.state.orders.orders.length
      const editedCount = this.$store.state.orders.orders.filter(
        (o) => o.edited
      ).length
      const orderNewCount = this.$store.state.orders.orders.filter(
        (o) => o.orderNew
      ).length
      const onHoldCount = this.$store.state.orders.orders.filter(
        (o) => o.onHold
      ).length
      let assignedCount = this.items.filter(
        (o) => o.contractors.length > 0
      ).length
      let unassignedCount = this.items.filter(
        (o) => !o.contractors.length
      ).length
      if (!this.totalEntries && !this.orderNew && !this.onHold) {
        assignedCount = this.$store.state.orders.orders.filter(
          (o) => o.contractors.length > 0
        ).length
        unassignedCount = this.$store.state.orders.orders.filter(
          (o) => !o.contractors.length
        ).length
      }
      return {
        totalEntriesCount,
        orderNewCount,
        onHoldCount,
        assignedCount,
        unassignedCount,
        editedCount,
      }
    },
    totalEntries: {
      get() {
        return this.$store.state.orders.totalEntries
      },
      set(payload) {
        this.$store.commit('orders/set_totalEntries', payload)
      },
    },
    orderNew: {
      get() {
        return this.$store.state.orders.orderNew
      },
      set(payload) {
        this.$store.commit('orders/set_orderNew', payload)
      },
    },
    onHold: {
      get() {
        return this.$store.state.orders.onHold
      },
      set(payload) {
        this.$store.commit('orders/set_onHold', payload)
      },
    },
    assigned: {
      get() {
        return this.$store.state.orders.assigned
      },
      set(payload) {
        this.$store.commit('orders/set_assigned', payload)
      },
    },
    unassigned: {
      get() {
        return this.$store.state.orders.unassigned
      },
      set(payload) {
        this.$store.commit('orders/set_unassigned', payload)
      },
    },
    edited: {
      get() {
        return this.$store.state.orders.edited
      },
      set(payload) {
        this.$store.commit('orders/set_edited', payload)
      },
    },
    addNewOrderModal: {
      get() {
        return this.$store.state.orders.addNewOrderModal
      },
      set(payload) {
        this.$store.commit('orders/set_addNewOrderModal', payload)
      },
    },
  },
  watch: {
    isAuth(newVal) {
      if (newVal && !this.items.length) {
        this.getOrders()
      }
    },
    cleanSelection(val) {
      if (val) {
        this.ordersSelected = []
      }
    },
    ordersSelected(val) {
      if (this.inModal) {
        this.$emit('orders-selected', val)
      }
    },
  },
  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },
  mounted() {
    if (this.inModal) {
      if (this.preselectedOrders.length) {
        this.ordersSelected.push(...this.preselectedOrders)
      }
    }
    if (this.isAuth && !this.items.length) {
      this.getOrders()
    } else {
      this.$nextTick(() => {
        this.showOrders = true
      })
    }
  },
  methods: {
    handleSearch() {
      this.openSearch = !this.openSearch
      this.$nextTick(() => {
        if (this.openSearch) {
          this.$refs.searchInput.focus()
        } else {
          this.$refs.searchInput.blur()
          this.search = ''
        }
      })
    },
    async getOrders() {
      try {
        this.loadingOrders = true
        this.showOrders = true
        await this.$store.dispatch('orders/get_orders')
        this.loadingOrders = false
      } catch (error) {
        this.loadingOrders = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async handlePriorityOrder(priority, item) {
      try {
        this.loading = true
        const objectToSend = { category: priority }
        await this.$store.dispatch('order/update_order', {
          orderId: item.id,
          objectToSend,
        })
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleAssignOrder(item) {
      this.orderSelected = item
      this.showAssignOrderModal = true
    },
    handleClickRow(item) {
      if (this.inModal) {
        this.ordersSelected.push(item)
        return
      }
      if (window.getSelection().toString()) {
        return
      }
      this.handleEditOrder(item)
    },
    async handlePriorityOrders(priority) {
      this.showPriorityOrderModal = false
      try {
        this.loading = true

        await this.$store.dispatch('orders/set_priority_order', {
          orderIds: this.ordersSelected.map((o) => o.id),
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
    async handleAssignOrders(contractors) {
      this.showSelectContractor = false

      try {
        this.loading = true
        const promises = []
        const objectToSend = {
          contractorsUids: contractors.map((contractor) => contractor.uid),
          contractors,
          assigned: contractors.length > 0,
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
        this.$mainAlertSuccess(this.$t('contractorAssigned'))
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleSeeInMapBtn() {
      this.$router.push({
        name: 'dispatching-routing',
        params: {
          orders: this.ordersSelected,
        },
      })
    },
    handleEditOrder(item) {
      this.$router.push(`/dispatching/${item.id}`)
    },
    handleDeleteOrder(item) {},
    handleShowImagesSlides(item) {
      this.showImagesSlides = true
      this.listUrl.splice(0, 1, item)
    },
  },
}
</script>
<style lang="scss" scoped>
.sqr-btn {
  width: 80px;
  aspect-ratio: 6/4;
  background-color: var(--v-secondary-base);
  margin-right: 4px;
  color: #fff;

  &.active {
    color: #fff;
  }
  &:hover {
    box-shadow: 0 0 6px #2b98f0;
  }
  .btn-title {
    font-size: 0.75rem;
  }
}
.small-font {
  font-size: 0.75rem;
}
.table-data-container {
  height: calc(100% - 125px);
}
.v-data-table::v-deep td {
  font-size: 14px !important;
}
::v-deep.v-data-table--dense
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td {
  width: 1%;
}
::v-deep .truncate {
  max-width: 1px;
  min-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-box {
  max-width: 0;
  position: relative;

  transition: max-width 150ms ease-in;
  .search-input {
    width: 300px;
  }

  &.open {
    transition: max-width 150ms ease-in;
    max-width: 1000px;
  }
}
.meta-info {
  font-size: 0.9rem;
  color: #757575;
}
.flag-icon {
  &.active {
    outline: 1px solid red;
  }
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
</style>
