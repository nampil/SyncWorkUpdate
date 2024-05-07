<template>
  <div class="h-100">
    <AisInstantSearch
      index-name="orders"
      :search-client="searchClient"
      :insights="true"
      :future="{ preserveSharedStateOnUnmount: true }"
      class="h-100 d-flex flex-column justify-center"
    >
      <!-- :initial-ui-state="initialUiState" -->
      <v-toolbar class="flex-grow-0 elevation-0">
        <action-details
          :orders-selected="ordersSelected"
          @actions-events="handleActions"
        ></action-details>

        <columns-details v-if="false"></columns-details>

        <v-divider vertical class="mx-4"></v-divider>

        <v-toolbar-title class="mr-4">Search Orders</v-toolbar-title>

        <AisSearchBox class="flex-grow-1" :show-loading-indicator="true">
          <template #default="{ currentRefinement, isSearchStalled, refine }">
            <v-text-field
              type="search"
              dense
              outlined
              :loading="isSearchStalled"
              hide-details
              :value="currentRefinement"
              :append-icon="currentRefinement ? 'mdi-close' : 'mdi-magnify'"
              @click:append="currentRefinement ? refine('') : null"
              @input="hanldelInput($event, refine)"
            >
            </v-text-field>
          </template>
        </AisSearchBox>
      </v-toolbar>
      <div class="search-container">
        <div class="inner-wrapper | d-flex">
          <aside class="aside h-100 overflow-y-auto pr-4">
            <ais-panel
              v-for="panel in refinementPanels"
              :key="panel.text"
              class="mb-4"
            >
              <template #header>
                <header
                  class="text-subtitle-1 info--text d-flex justify-space-between"
                >
                  <span>{{ panel.text }}</span>
                  <v-btn
                    icon
                    small
                    @click="panel.showSearch = !panel.showSearch"
                  >
                    <v-icon small>mdi-magnify</v-icon>
                  </v-btn>
                </header>
              </template>
              <ais-refinement-list
                :attribute="panel.value"
                :sort-by="['name']"
                :searchable="panel.searchable"
                class="refinement-list"
              >
                <template
                  #default="{
                    items,
                    isFromSearch,
                    refine,

                    searchForItems,
                  }"
                >
                  <transition name="appears">
                    <v-text-field
                      v-if="panel.showSearch"
                      outlined
                      dense
                      hide-details
                      placeholder="Search Status"
                      @input="searchForItems($event)"
                    ></v-text-field>
                  </transition>

                  <ul>
                    <li v-if="isFromSearch && !items.length">No results.</li>
                    <li v-for="item in items" :key="item.value">
                      <v-btn
                        x-small
                        text
                        :color="item.isRefined ? 'accent' : ''"
                        @click.prevent="refine(item.value)"
                      >
                        <ais-highlight attribute="item" :hit="item" />
                      </v-btn>
                      <span class="pill">{{
                        item.count.toLocaleString()
                      }}</span>
                    </li>
                  </ul>
                </template>
              </ais-refinement-list>
            </ais-panel>
          </aside>
          <div class="hits-container | flex-grow-1 h-100 px-4">
            <search-hits class="h-100">
              <template #hits-header="{ hits }">
                <div
                  class="headers secondary primary--text text--lighten-4 px-0 py-2 d-flex align-center gap-8"
                >
                  <div class="checker-space">
                    <v-checkbox
                      hide-details
                      dense
                      class="ma-0 pt-0"
                      :ripple="false"
                      @change="handleselectAll($event, hits)"
                    ></v-checkbox>
                  </div>

                  <div
                    v-for="(header, index) in headers"
                    :key="index"
                    :cols="header.cols"
                    :class="header.class + ' header'"
                  >
                    {{ header.text.toUpperCase() }}
                  </div>
                </div>
              </template>
              <template #item="{ item, index }">
                <!-- <div class="order-item py-1"> -->
                <header
                  class="order-item-header d-flex gap-8 align-center py-1"
                >
                  <v-checkbox
                    v-model="ordersSelected"
                    :value="item.id"
                    hide-details
                    dense
                    class="ma-0 pt-0"
                    :ripple="false"
                  ></v-checkbox>
                  <div class="item-index">{{ index + 1 }}</div>

                  <div class="header-woNumber">
                    <h4 class="item-woNumber | ma-0">
                      {{ item.woNumber }}
                    </h4>
                  </div>

                  <div>
                    <span class="item-address">
                      {{
                        `${item.address}
                          ${item.city ? ' ' + item.city : ''}
                          ${item.county ? ' ' + item.county : ''}
                          ${item.state ? ', ' + item.state : ''}
                          ${item.zip ? ', ' + item.zip : ''}
                          `
                      }}
                    </span>
                  </div>

                  <div
                    class="item-actions | px-1 d-flex gap-8 align-center justify-center"
                  >
                    <v-btn
                      small
                      icon
                      nuxt
                      :to="{
                        name: 'dispatching-id',
                        params: { id: item.id },
                      }"
                    >
                      <v-icon small>mdi-file-document-edit-outline</v-icon>
                    </v-btn>

                    <v-menu
                      offset-x
                      offset-y
                      left
                      :close-on-content-click="false"
                      nudge-left="50"
                    >
                      <template #activator="{ on, attrs }">
                        <v-btn small icon v-bind="attrs" v-on="on">
                          <v-icon small>mdi-home-clock-outline</v-icon>
                        </v-btn>
                      </template>
                      <property-history :order="item"></property-history>
                    </v-menu>
                    <v-menu
                      offset-x
                      offset-y
                      left
                      :close-on-content-click="false"
                      nudge-left
                      max-width="400"
                      min-width="400"
                      max-height="300"
                    >
                      <template #activator="{ on, attrs }">
                        <v-btn small icon v-bind="attrs" v-on="on">
                          <v-icon small>mdi-notebook</v-icon>
                        </v-btn>
                      </template>
                      <OrderJobNotes
                        :order-id="item.id"
                        :property-id="item.propertyId"
                      ></OrderJobNotes>
                    </v-menu>
                  </div>
                </header>
                <div class="d-flex align-center gap-8 terciary">
                  <div class="checker-space"></div>

                  <div
                    v-for="h in headers"
                    :key="h.text"
                    :class="h.class + ' item-cell'"
                    :cols="h.cols"
                    :title="`${item[h.value] ?? ''}`"
                  >
                    {{ item[h.value] }}
                  </div>
                </div>
                <!-- </div> -->
              </template>
            </search-hits>
          </div>
        </div>
      </div>
    </AisInstantSearch>
    <AssignOrderModal
      :show="showAssignOrderModal"
      :order="orderSelected"
      @close="showAssignOrderModal = false"
      @save="handleAssignOrders"
    />
    <PriorityOrdersModal
      :show="showPriorityOrderModal"
      @close="showPriorityOrderModal = false"
      @save="handlePriorityOrders"
    />
    <set-clients-to-orders-modal
      :show="showSetClientToOrdersModal"
      :order-ids="ordersSelected"
      @close="
        showSetClientToOrdersModal = false
        ordersSelected = []
      "
    />
    <set-status-to-orders-modal
      :show="showSetStatusToOrdersModal"
      :order-ids="ordersSelected"
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
  </div>
</template>

<script>
import {
  AisSearchBox,
  AisInstantSearch,
  AisRefinementList,
  AisPanel,
  AisHighlight,
  /* AisMenu, */
  /* AisInfiniteHits, */
} from 'vue-instantsearch'

import algoliasearch from 'algoliasearch/lite'
import SearchHits from '@/components/home/SearchHits.vue'
import OrderJobNotes from '~/components/home/OrderJobNotes.vue'
import ActionDetails from '~/components/home/menus/ActionDetails.vue'
import ColumnsDetails from '~/components/home/menus/ColumnsDetails.vue'
import AssignOrderModal from '~/components/orders/modals/AssignOrderModal.vue'
import PriorityOrdersModal from '~/components/orders/modals/PriorityOrdersModal.vue'
import SetClientsToOrdersModal from '~/components/orders/modals/SetClientsToOrdersModal.vue'
import SetStatusToOrdersModal from '~/components/orders/modals/SetStatusToOrdersModal.vue'
import SelectContractor from '~/components/orders/modals/SelectContractor.vue'
import SelectProcessor from '~/components/orders/modals/SelectProcessor.vue'
import PropertyHistory from '~/components/orders/propertyHistory/PropertyHistory.vue'

export default {
  name: 'SearchIndex',
  components: {
    /* AisMenu, */
    AisSearchBox,
    AisInstantSearch,
    /* AisInfiniteHits, */
    AisRefinementList,
    AisPanel,
    AisHighlight,
    SearchHits,
    OrderJobNotes,
    ActionDetails,
    ColumnsDetails,
    AssignOrderModal,
    PriorityOrdersModal,
    PropertyHistory,
    SetClientsToOrdersModal,
    SetStatusToOrdersModal,
    SelectContractor,
    SelectProcessor,
  },

  layout: 'dash',
  data() {
    return {
      searchClient: algoliasearch(
        this.$config.algoliaAppId,
        this.$config.algoliaSearchKey
      ),
      ordersSelected: [],
      selectAll: false,
      showAssignOrderModal: false,
      showPriorityOrderModal: false,
      showSetClientToOrdersModal: false,
      showSetStatusToOrdersModal: false,
      showSelectContractor: false,
      showSelectProcessor: false,
      orderSelected: {},
      showSearchStatus: false,
      showSearchState: false,
      refinementPanels: [
        {
          text: 'General Status',
          value: 'generalStatus',
          searchable: true,
          showSearch: false,
        },
        {
          text: 'Sub Status',
          value: 'status',
          searchable: true,
          showSearch: false,
        },
        { text: 'State', value: 'state', searchable: true, showSearch: false },
        {
          text: 'Processor',
          value: 'processorName',
          searchable: true,
          showSearch: false,
        },
      ],
    }
  },
  head() {
    return {
      title: 'Search Orders',
    }
  },
  computed: {
    allSelected() {
      return this.ordersSelected.length === this.hits.length
    },
    users() {
      return this.$store.state.users.users
    },
    userHeaders() {
      return this.$store.state.auth.user.preferences.headers
    },
    headers() {
      return [
        {
          text: 'Status',
          cols: '1',
          class: 'truncate',
          value: 'status',
        },
        {
          text: 'Received Date',
          cols: '2',
          class: '',
          value: 'dateReceived',
        },
        {
          text: 'Category',
          cols: '2',
          class: '',
          value: 'category',
        },
        {
          text: 'Processor',
          cols: '2',
          class: 'truncate',
          value: 'processorName',
        },
        // {
        //   text: 'Property Id',
        //   cols: '2',
        //   class: 'truncate',
        //   value: 'propertyId',
        // },
        // {
        //   text: 'Invoice Sent to Client Date',
        //   cols: '2',
        //   class: 'truncate',
        //   value: 'invoiceCompletedDate',
        // },
        {
          text: 'Contractors',
          cols: '4',
          class: 'truncate',
          value: 'contractors',
        },

        { text: '', cols: '1', class: '', value: 'action' },
      ]
      // if (this.userHeaders && this.userHeaders.length) {
      //   const _headers = JSON.parse(JSON.stringify(this.userHeaders))

      //   _headers.forEach((element) => {

      //     const _text = element.text.split(' ').join('').toLowerCase()
      //     element.text = this.$t(_text)
      //     if (!element.width || !element.width.includes('%')) {
      //       element.width = '10%'
      //     }
      //     if (element.text === 'contractors') {
      //       element.width = '15%'
      //       element.cellClass = ['truncate']
      //     }

      //     element.class = 'header-text ' + `${element.class ?? ''}`
      //   })

      //   return _headers
      // } else {
      //   return this.headersDefault
      // }
    },
    headersDefault() {
      return this.$store.state.home.headersDefault
    },
    storeFilters() {
      return this.$store.state.auth.user.preferences.ordersFilters
    },
    // initialUiState() {
    //   if (!this.storeFilters) {
    //     return { orders: { query: '' } }
    //   }
    //   return {
    //     orders: {
    //       query: Object.keys(this.storeFilters)
    //         .filter((f) => !!this.storeFilters[f])
    //         .map((f) => this.storeFilters[f])
    //         .join(' '),
    //     },
    //   }
    // },
  },
  methods: {
    handleselectAll(event, hits) {
      this.ordersSelected = event ? hits.map((hit) => hit.id) : []
    },
    hanldelInput(event, refine) {
      refine(event)
    },
    visibilityChanged(isVisible) {
      if (isVisible && !this.state.isLastPage) {
        this.state.showMore()
      }
    },
    handleselectOrder(event, order) {
      if (event) {
        this.ordersSelected.push(order)
      } else {
        this.ordersSelected = this.ordersSelected.filter(
          (o) => o.id !== order.id
        )
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
          const orderId = this.ordersSelected[index]
          const promise = this.$store.dispatch('order/update_order', {
            orderId,
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

    handleArchiveOrder() {},
    handleSetOnHoldOrder() {},
    async handlePriorityOrders(priority) {
      this.showPriorityOrderModal = false
      try {
        this.loading = true

        await this.$store.dispatch('orders/set_priority_order', {
          orderIds: this.ordersSelected,
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

    handleActions(action) {
      switch (action) {
        case 'set_status':
          this.showSetStatusToOrdersModal = true
          break
        case 'archive':
          this.handleArchiveOrder()
          break

        case 'set_category':
          this.showPriorityOrderModal = true
          break
        case 'set_client':
          this.showSetClientToOrdersModal = true
          break
        case 'selectProcessor':
          this.showSelectProcessor = true

          break
        case 'selectContractors':
          this.showSelectContractor = true
          break

        default:
          break
      }
      // eslint-disable-next-line
      console.log('action: ', action)
    },
  },
}
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  height: 100%;
}
.inner-wrapper {
  position: absolute;
  inset: 0;
}
.hits-container {
  width: calc(100% - 250px);
  font-size: 0.85rem;
}
.aside {
  flex: 0 0 250px;
  width: 250px;
  padding: 1rem;
}
.order-item {
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.headers {
  width: fit-content;
  min-width: 100%;
  font-size: 0.75rem;
  font-weight: 500;
}
.header,
.item-cell {
  width: 150px;
  flex: 1 0 150px;
}

.theme--dark {
  .header-woNumber {
    color: var(--v-accent-base);
  }
}
.header-woNumber {
  color: var(--v-primary-base);
  min-width: 100px;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-index {
  min-width: 3ch;
  text-align: right;
}
.item-actions {
  max-width: 10%;
  flex: 1 0 10%;

  margin-left: auto;
}
.order-item-header {
  position: sticky;
  left: 0;
  top: 0;
}
.checker-space {
  width: 40px;
  flex: 0 0 40px;
}
.refinement-list ul {
  padding: 0;
  margin: 0;
  list-style: none;
}
.pill {
  background-color: var(--v-secondary-base);
  color: white;
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 8px;
  font-size: 0.7rem;
  font-weight: 500;
}

.appears-enter-active,
.appears-leave-active {
  max-height: 1000px;
  transition: opacity 300ms ease-in-out, max-height 300ms ease-in-out;
}
.appears-enter,
.appears-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
