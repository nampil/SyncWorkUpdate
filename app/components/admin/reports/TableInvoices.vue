<template>
  <div class="container-filter-details d-flex overflow-y-auto overflow-x-auto">
    <!-- <v-btn @click="updateInvoice" :loading="loading">Update</v-btn> -->

    <div class="d-flex flex-column">
      <FilterDetailsInvoice
        :loading="loading"
        @handle-send-filters="handleSendFilters($event)"
      ></FilterDetailsInvoice>

      <div
        v-for="(type, i) in Object.keys(ordersApplyingFilters)"
        :key="i"
        class="table-data-container d-flex pl-2 pr-2"
      >
        <v-data-table
          :headers="headers"
          :items="ordersApplyingFilters[type]"
          class="orders-table elevation-1 h-100"
          item-key="id"
          :loading="loading"
          dense
          fixed-header
          hide-default-footer
          :options="{
            itemsPerPage: ordersApplyingFilters[type]?.length,
          }"
          @click:row="handleClickRow"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:item.clientInvoiceTotal="{ item }">
            <span
              >${{
                item.clientInvoiceTotal ? item.clientInvoiceTotal : '0.00'
              }}</span
            >
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.clientDiscountTotal="{ item }">
            <span
              >${{
                item.clientDiscountTotal ? item.clientDiscountTotal : '0.00'
              }}</span
            >
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.clientDiscount="{ item }">
            <span>{{ item.clientDiscount }}%</span>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.clientInvoicePayment="{ item }">
            <span
              >$
              {{
                item.clientInvoicePayment ? item.clientInvoicePayment : '0.00'
              }}
            </span>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.writeOffAmount="{ item }">
            <span
              >$
              {{ item.writeOffAmount ? item.writeOffAmount : '0.00' }}
            </span>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.invoice="{ item }">
            <span>
              {{
                item.invoice?.sentTimestamp
                  ? $formatDate(item.invoice.sentTimestamp, {
                      time: false,
                    })
                  : ''
              }}
            </span>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:item.contractorList="{ item }">
            <v-tooltip
              v-if="item.contractorList.length"
              open-delay="600"
              content-class="small"
              top
              color="secondary"
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on"
                  >{{ item.contractorList[0]
                  }}{{ item.contractorList.length === 1 ? '.' : '...' }}</span
                >
              </template>

              <span
                v-for="(contractor, c) in item.contractorList"
                :key="contractor.uid"
              >
                {{ contractor
                }}{{ c !== item.contractorList.length - 1 ? ',' : '.' }}
              </span>
            </v-tooltip>
          </template>

          <!-- eslint-disable-next-line -->
          <template v-slot:footer>
            <div
              v-if="ordersApplyingFilters[type].length"
              class="footer-table | d-flex pa-3"
            >
              <v-spacer></v-spacer>

              <span class="min-width"
                >Total Records: {{ ordersApplyingFilters[type].length }}
              </span>

              <span class="min-width d-flex justify-center spacer-col-small">
                ${{
                  ordersApplyingFilters[type]
                    .reduce(
                      (a, b) =>
                        b.clientInvoiceTotal
                          ? a + parseFloat(b.clientInvoiceTotal)
                          : a + 0,
                      0
                    )
                    .toFixed(2)
                }}</span
              >

              <span class="min-width d-flex justify-center mr-14">
                ${{
                  ordersApplyingFilters[type]
                    .reduce(
                      (a, b) =>
                        b.clientDiscountTotal
                          ? a + parseFloat(b.clientDiscountTotal)
                          : a + 0,
                      0
                    )
                    .toFixed(2)
                }}</span
              >

              <div class="d-flex flex-column min-width justify-center">
                <span>
                  ${{
                    ordersApplyingFilters[type]
                      .reduce(
                        (a, b) =>
                          b.clientInvoicePayment
                            ? a + parseFloat(b.clientInvoicePayment)
                            : a + 0,
                        0
                      )
                      .toFixed(2)
                  }}</span
                >

                <span class="pt-2"
                  >Total Due: ${{
                    (
                      ordersApplyingFilters[type].reduce(
                        (a, b) =>
                          b.clientDiscountTotal
                            ? a + parseFloat(b.clientDiscountTotal)
                            : a + 0,
                        0
                      ) -
                      ordersApplyingFilters[type].reduce(
                        (a, b) =>
                          b.clientInvoicePayment
                            ? a + parseFloat(b.clientInvoicePayment)
                            : a + 0,
                        0
                      )
                    ).toFixed(2)
                  }}
                </span>
              </div>
              <span class="spacer-col"> $0.00 </span>
            </div>
          </template>
        </v-data-table>
      </div>

      <v-divider
        v-if="
          ordersApplyingFilters[Object.keys(ordersApplyingFilters)[0]]?.length
        "
        class="divider-footer | ml-2 mr-2"
      ></v-divider>

      <div
        v-if="
          ordersApplyingFilters[Object.keys(ordersApplyingFilters)[0]]?.length
        "
        class="footer-table | ml-2 mr-2 d-flex pa-3"
      >
        <v-spacer></v-spacer>
        <span class="pr-2">Total Records: {{ orders.length }}</span>
        <span class="pr-12">
          Grand Totals from
          {{
            $formatDate(fromDate, {
              time: false,
            })
          }}
          to
          {{
            $formatDate(toDate, {
              time: false,
            })
          }}
        </span>

        <span class="min-width d-flex justify-center spacer-col-small">
          ${{
            orders
              .reduce(
                (a, b) =>
                  b.clientInvoiceTotal
                    ? a + parseFloat(b.clientInvoiceTotal)
                    : a + 0,
                0
              )
              .toFixed(2)
          }}
        </span>

        <span class="min-width d-flex justify-center mr-14">
          ${{
            orders
              .reduce(
                (a, b) =>
                  b.clientDiscountTotal
                    ? a + parseFloat(b.clientDiscountTotal)
                    : a + 0,
                0
              )
              .toFixed(2)
          }}</span
        >

        <div class="d-flex flex-column min-width justify-center">
          <span>
            ${{
              orders
                .reduce(
                  (a, b) =>
                    b.clientInvoicePayment
                      ? a + parseFloat(b.clientInvoicePayment)
                      : a + 0,
                  0
                )
                .toFixed(2)
            }}</span
          >

          <span class="pt-2">
            Client Total Due: ${{
              (
                orders.reduce(
                  (a, b) =>
                    b.clientDiscountTotal
                      ? a + parseFloat(b.clientDiscountTotal)
                      : a + 0,
                  0
                ) -
                orders.reduce(
                  (a, b) =>
                    b.clientInvoicePayment
                      ? a + parseFloat(b.clientInvoicePayment)
                      : a + 0,
                  0
                )
              ).toFixed(2)
            }}
          </span>
        </div>

        <span class="spacer-col"> $0.00 </span>
      </div>
    </div>
  </div>
</template>

<script>
import FilterDetailsInvoice from './FilterDetailsInvoice.vue'
import { ORDER_STATUS } from '~/utils/dictionaries'
export default {
  name: 'FilterDetailsInvoices',
  components: { FilterDetailsInvoice },
  data() {
    return {
      fromDate: '',
      toDate: '',
      loading: false,
      range: true,
      orders: [],
      loadingOrders: false,
      headers: [
        {
          text: 'Invoice #'.toUpperCase(),
          value: 'invoiceNumber',
          width: '10%',
          align: 'center',
          cellClass: ['min-width-small'],
          sortable: true,
        },
        {
          text: 'Invoice Date'.toUpperCase(),
          value: 'invoiceDate',
          width: '10%',
          align: 'center',
          cellClass: ['min-width-small'],
          sortable: true,
          sort: (a, b) => {
            if (!a) {
              return -1
            }
            if (!b) {
              return 0
            }
            const [aMonth, aDay, aYear] = a.split('-')
            const [bMonth, bDay, bYear] = b.split('-')
            const aTimestamp = new Date(aYear, aMonth - 1, aDay)
            const bTimestamp = new Date(bYear, bMonth - 1, bDay)
            if (aTimestamp < bTimestamp) {
              return -1
            } else if (aTimestamp > bTimestamp) {
              return 1
            } else return 0
          },
        },
        {
          text: this.$t('wo#'),
          value: 'woNumber',
          width: '10%',
          align: 'center',
          sortable: true,
        },
        {
          text: this.$t('duedate').toUpperCase(),
          value: 'dateDueFormatted',
          width: '15%',
          align: 'center',
          cellClass: ['min-width'],
          sortable: true,
          sort: (a, b) => {
            const [aMonth, aDay, aYear] = a.split('-')
            const [bMonth, bDay, bYear] = b.split('-')
            const aTimestamp = new Date(aYear, aMonth - 1, aDay)
            const bTimestamp = new Date(bYear, bMonth - 1, bDay)
            if (aTimestamp < bTimestamp) {
              return -1
            } else if (aTimestamp > bTimestamp) {
              return 1
            } else return 0
          },
        },
        {
          text: this.$t('address').toUpperCase(),
          value: 'address',
          width: '15%',
          align: 'left',
          cellClass: ['truncate'],
          sortable: true,
        },
        {
          text: this.$t('state').toUpperCase(),
          value: 'state',
          width: '15%',
          align: 'left',
          cellClass: ['min-width-small'],
          sortable: true,
        },
        {
          text: this.$t('city').toUpperCase(),
          value: 'city',
          width: '15%',
          align: 'left',
          cellClass: ['min-width-small'],
          sortable: true,
        },
        {
          text: this.$t('zip').toUpperCase(),
          value: 'zip',
          width: '15%',
          align: 'left',
          cellClass: ['min-width'],
          sortable: true,
        },
        {
          text: this.$t('client').toUpperCase(),
          value: 'client',
          width: '15%',
          align: 'left',
          cellClass: ['min-width'],
          sortable: true,
        },
        {
          text: this.$t('processor').toUpperCase(),
          value: 'processor',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: this.$t('contractors').toUpperCase(),
          value: 'contractorList',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: this.$t('status').toUpperCase(),
          value: 'status',
          width: '10%',
          align: 'center',
          cellClass: ['truncate'],
          sortable: true,
        },
        {
          text: 'Client Invoice Total'.toUpperCase(),
          value: 'clientInvoiceTotal',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: 'Client Discount%'.toUpperCase(),
          value: 'clientDiscount',
          cellClass: ['min-width-small'],
          align: 'center',
          sortable: true,
        },
        {
          text: 'Client Discount Total'.toUpperCase(),
          value: 'clientDiscountTotal',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        // {
        //   text: 'Client Paid Date',
        //   value: 'clientPaidDatel',
        //   cellClass: ['min-width-small'],
        //   align: 'center',
        //   sortable: true,
        // },
        {
          text: 'Client Invoice Payment'.toUpperCase(),
          value: 'clientInvoicePayment',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: 'Write Off Amount'.toUpperCase(),
          value: 'writeOffAmount',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: 'Sent to Client'.toUpperCase(),
          value: 'invoice',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
          sort: (a, b) => {
            if (!a.sentDate) {
              return -1
            }
            if (!b.sentDate) {
              return 0
            }
            const [aMonth, aDay, aYear] = a.sentDate.split('-')
            const [bMonth, bDay, bYear] = b.sentDate.split('-')
            const aTimestamp = new Date(aYear, aMonth - 1, aDay)
            const bTimestamp = new Date(bYear, bMonth - 1, bDay)
            if (aTimestamp < bTimestamp) {
              return -1
            } else if (aTimestamp > bTimestamp) {
              return 1
            } else return 0
          },
        },
      ],
      showClientGroup: false,
      showProcessorGroup: false,
      showContractorGroup: false,
      statesSelected: [],
      clientsSelected: [],
      customersSelected: [],
      contractorsSelected: [],
      processorsSelected: [],
      readyForOffice: false,
    }
  },
  computed: {
    users() {
      return this.$store.state.users.users
    },
    ordersFormatted() {
      const _orders = []

      this.orders.forEach((order) => {
        if (!order.processor) {
          _orders.push({ ...order })
          return
        }
        _orders.push({
          ...order,
          processor: this.users.find((u) => u.uid === order.processor)
            ?.fullName,
        })
      })
      return _orders
    },

    ordersApplyingFilters() {
      const _orders =
        this.statesSelected?.length ||
        this.clientsSelected?.length ||
        this.customersSelected?.length ||
        this.contractorsSelected?.length ||
        this.processorsSelected?.length ||
        this.readyForOffice
          ? []
          : this.ordersFormatted

      if (!_orders.length) {
        for (let i = 0; i < this.ordersFormatted.length; i++) {
          const _order = this.ordersFormatted[i]

          const _selected =
            ((this.statesSelected?.length &&
              this.statesSelected.includes(_order.state)) ||
              !this.statesSelected?.length) &&
            ((this.clientsSelected?.length &&
              this.clientsSelected.includes(_order.client)) ||
              !this.clientsSelected?.length) &&
            ((this.customersSelected?.length &&
              this.customersSelected.includes(_order.customer)) ||
              !this.customersSelected?.length) &&
            ((this.contractorsSelected?.length &&
              _order.contractors.some((c) =>
                this.contractorsSelected.includes(c.uid)
              )) ||
              !this.contractorsSelected?.length) &&
            ((this.processorsSelected?.length &&
              this.processorsSelected.includes(_order.processor)) ||
              !this.processorsSelected?.length) &&
            ((this.readyForOffice &&
              _order.status?.trim().toLowerCase() ===
                ORDER_STATUS.readyForOffice.toLowerCase()) ||
              !this.readyForOffice)

          if (_selected) {
            _orders.push(_order)
          }
        }
      }

      if (
        !_orders.length ||
        (!this.showClientGroup &&
          !this.showContractorGroup &&
          !this.showProcessorGroup)
      ) {
        return { general: _orders }
      }

      const clientGroup = {}
      const processorGroup = {}
      const contractorGroup = {}
      for (let i = 0; i < _orders.length; i++) {
        const _order = _orders[i]

        if (this.showClientGroup) {
          const _client =
            _order.client?.replace(/[^a-zA-Z0-9 ]/g, '') || 'vacio'
          if (!clientGroup[_client]) {
            clientGroup[_client] = [_order]
          } else {
            clientGroup[_client].push(_order)
          }
        }

        if (this.showProcessorGroup) {
          const _processor = _order.processor || 'vacio'

          if (!processorGroup[_processor]) {
            processorGroup[_processor] = [_order]
          } else {
            processorGroup[_processor].push(_order)
          }
        }

        if (this.showContractorGroup) {
          const _contractorsUid = _order?.contractors
            .map((c) => c.uid)
            .toString() || ['vacio']

          if (!contractorGroup[_contractorsUid]) {
            contractorGroup[_contractorsUid] = [_order]
          } else {
            contractorGroup[_contractorsUid].push(_order)
          }
        }
      }

      return { ...clientGroup, ...contractorGroup, ...processorGroup }
    },
  },

  methods: {
    async handleSendFilters(event) {
      const {
        clientGroup,
        processorGroup,
        contractorsGroup,
        clientsSelected,
        statesSelected,
        customersSelected,
        fromDate,
        toDate,
        invoiceCreated,
        invoiceCompleted,
        invoiceSenttoClient,
        contractorsSelected,
        processorsSelected,
        readyForOffice,
      } = event

      this.showClientGroup = clientGroup
      this.showProcessorGroup = processorGroup
      this.showContractorGroup = contractorsGroup
      this.statesSelected = statesSelected
      this.clientsSelected = clientsSelected
      this.customersSelected = customersSelected
      this.fromDate = fromDate
      this.toDate = toDate
      this.contractorsSelected = contractorsSelected
      this.processorsSelected = processorsSelected
      this.readyForOffice = readyForOffice

      if (!event.range) {
        this.showFilter = false
        return
      }

      try {
        this.loading = true
        const _orders = await this.$store.dispatch(
          'admin/reports/get_reportsInvoices',
          {
            fromDate,
            toDate,
            invoiceCreated,
            invoiceCompleted,
            invoiceSenttoClient,
          }
        )

        this.orders = _orders
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.showFilter = false
        this.loading = false
        this.range = false
      }
    },
    async updateInvoice() {
      try {
        this.loading = true
        await this.$store.dispatch('admin/reports/update_invoice')

        this.loading = false
      } catch (error) {
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
  },
}
</script>
<style lang="scss" scoped>
::v-deep.v-data-table--dense
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td {
  width: 1%;
  font-size: 0.75rem;
}

::v-deep.v-data-table--dense > .v-data-table__wrapper {
  overflow-x: hidden;
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
.footer-table {
  background-color: var(--v-terciary-base);
  font-size: 0.75rem;
}

.divider-footer {
  border-color: rgba(255, 255, 255, 0.259);
}
.spacer-col {
  margin-right: 205px;
  margin-left: 10px;
}

.spacer-col-small {
  margin-right: 95px;
}

.container-filter-details {
  height: calc(100% - 85px);
}
</style>
