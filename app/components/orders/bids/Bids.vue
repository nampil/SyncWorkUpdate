<template>
  <div class="container-table-bids | h-100 d-flex flex-column">
    <div class="table-data flex-grow-1 pa-2 pl-6 pr-6">
      <v-data-table
        :headers="headers"
        :items="bidsFormatted"
        fixed-header
        class="elevation-1 h-100"
        :items-per-page="15"
        :loading="loading"
        :search="search"
        height="80%"
        dense
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:top>
          <v-toolbar flat dense dark color="secondary">
            <v-toolbar-title>Bids</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>

            <div class="search-box | d-flex align-center gap-8">
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
              <v-btn
                color="primary"
                small
                icon
                class="mr-1"
                @click="handleShowSearch"
                ><v-icon size="20">mdi-magnify</v-icon></v-btn
              >
            </div>
            <div class="mr-2">
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="primary"
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click="showBidsHistory = !showBidsHistory"
                    ><v-icon size="20">mdi-history</v-icon></v-btn
                  >
                </template>
                <span>Show Bids History</span>
              </v-tooltip>
            </div>

            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  x-small
                  class="mr-4"
                  v-bind="attrs"
                  v-on="on"
                  @click="downloadAll"
                >
                  <v-icon size="20" color="primary">
                    mdi-tray-arrow-down
                  </v-icon>
                </v-btn>
              </template>
              <span>Download all Photos</span>
            </v-tooltip>

            <v-dialog
              v-model="dialog"
              :overlay="false"
              transition="dialog-transition"
              persistent
              fullscreen
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn x-small color="primary" dark v-bind="attrs" v-on="on">
                  {{ $t('add') }}
                </v-btn>
              </template>

              <v-card
                class="elevation-0 d-flex flex-column overflow-hidden h-100"
              >
                <v-toolbar color="secondary flex-grow-0" dense>
                  <v-btn icon dark @click="handleCancel">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-toolbar-title class="d-flex aling-center">
                    {{
                      editedIndex === -1 ? 'New Bids' : 'Update Bid'
                    }}</v-toolbar-title
                  >
                  <v-spacer></v-spacer>
                  <v-toolbar-items
                    ><v-btn
                      v-if="editedIndex === -1"
                      ref="botonSave"
                      text
                      :loading="loadingSend"
                      @click="handleBid()"
                    >
                      {{ $t('send') }}
                    </v-btn>
                    <v-btn
                      v-else
                      ref="botonUpdate"
                      text
                      :loading="loadingSend"
                      @click="handleUpdateBid()"
                    >
                      {{ $t('update') }}
                    </v-btn>
                  </v-toolbar-items>
                </v-toolbar>

                <v-card-text class="flex-grow-1 pa-0">
                  <v-row no-gutters class="row">
                    <v-col cols="6" class="col">
                      <v-container class="form-container">
                        <v-form ref="newBid" class="mt-3">
                          <v-row>
                            <v-col cols="12">
                              <v-combobox
                                v-model="newBid.title"
                                :items="bidsTemplates"
                                item-text="title"
                                :label="$t('title')"
                                dense
                                outlined
                                :rules="[(v) => !!v || $t('titleRequired')]"
                                autofocus
                                hide-details="auto"
                                @input="handleBidTitle($event)"
                              >
                                <!-- eslint-disable-next-line -->
                                <template v-slot:no-data>
                                  <v-list-item>
                                    <v-list-item-content>
                                      <v-list-item-title>
                                        {{ $t('No results matching what was') }}
                                        "<strong>{{ $t('added') }}</strong
                                        >",
                                        {{ $t('Press') }}
                                        <kbd>{{ $t('enter') }}</kbd>
                                        {{ $t('to create a new one') }}.
                                      </v-list-item-title>
                                    </v-list-item-content>
                                  </v-list-item>
                                </template>
                              </v-combobox>
                            </v-col>

                            <v-col cols="12">
                              <v-textarea
                                v-model="newBid.desc"
                                :label="$t('description')"
                                dense
                                hide-details="auto"
                                :rules="[
                                  (v) => !!v || $t('descriptionRequired'),
                                ]"
                                outlined
                              ></v-textarea>
                            </v-col>
                          </v-row>

                          <v-row
                            v-for="(
                              alternativeTitle, i
                            ) in newBid.alternativeTitles"
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
                            <v-col cols="2">
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
                            <v-col cols="3">
                              <v-text-field
                                v-model="newBid.qty"
                                :label="$t('qty')"
                                outlined
                                dense
                                hide-details="auto"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="9"></v-col>
                            <v-col cols="6">
                              <v-text-field
                                v-model="newBid.contractorPrice"
                                label="Contractor Price"
                                prefix="$"
                                outlined
                                dense
                                hide-details="auto"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                prefix="$ Total:"
                                :value="
                                  !isNaN(newBid.contractorPrice) &&
                                  !isNaN(newBid.qty)
                                    ? newBid.contractorPrice * newBid.qty
                                    : 0
                                "
                                solo
                                readonly
                                dense
                                hide-details="auto"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                v-model="newBid.clientPrice"
                                label="Client Price"
                                prefix="$"
                                outlined
                                dense
                                hide-details="auto"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                prefix="$ Total:"
                                :value="
                                  !isNaN(newBid.clientPrice) &&
                                  !isNaN(newBid.qty)
                                    ? newBid.clientPrice * newBid.qty
                                    : 0
                                "
                                solo
                                readonly
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

                            <v-col
                              v-if="reportsToSend && reportsToSend.length"
                              cols="12"
                              class="d-flex"
                              ><span class="text-subtitle-1"
                                >Photos Selected</span
                              >

                              <v-tooltip
                                open-delay="600"
                                content-class="small"
                                top
                              >
                                <!-- eslint-disable-next-line -->
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    icon
                                    class="ml-auto"
                                    x-small
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="
                                      showReportsDownload = !showReportsDownload
                                    "
                                  >
                                    <v-icon small color="primary">
                                      mdi-tray-arrow-down
                                    </v-icon>
                                  </v-btn>
                                </template>
                                <span>Download Photos</span>
                              </v-tooltip>
                            </v-col>
                          </v-row>

                          <div
                            v-if="reportsToSend && reportsToSend.length"
                            class="previews | mb-0 ml-0 mt-0"
                          >
                            <div
                              v-for="(report, j) in reportsToSend"
                              :key="j"
                              class="preview | text-right"
                            >
                              <img
                                :src="report.url"
                                alt=""
                                height="95px"
                                width="95px"
                                @mousemove="zoomHover($event, report)"
                                @mouseleave="zoomLeave($event)"
                                @click="handleShowSlideShow(reportsToSend, j)"
                              />
                              <v-tooltip
                                open-delay="600"
                                content-class="small"
                                top
                              >
                                <!-- eslint-disable-next-line -->
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    icon
                                    class="delete-icon"
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="handleDeleteReport(report)"
                                  >
                                    <v-icon color="error" small
                                      >mdi-delete</v-icon
                                    >
                                  </v-btn>
                                </template>
                                <span>{{ $t('deleteImage') }}</span>
                              </v-tooltip>

                              <div
                                v-if="report.placard"
                                class="container-placard | d-flex align-center"
                              >
                                <v-tooltip
                                  open-delay="600"
                                  content-class="small"
                                  top
                                >
                                  <!-- eslint-disable-next-line -->
                                  <template v-slot:activator="{ on, attrs }">
                                    <span
                                      class="placard-text | pl-1 pr-1"
                                      v-bind="attrs"
                                      v-on="on"
                                      >{{
                                        $truncate(report.placard.text, 13)
                                      }}</span
                                    >
                                  </template>
                                  <span>{{ report.placard.text }}</span>
                                </v-tooltip>
                              </div>
                            </div>
                          </div>
                        </v-form>
                      </v-container>
                    </v-col>

                    <v-divider vertical></v-divider>

                    <v-col cols="6" class="col">
                      <div class="d-flex pa-3 pt-2 align-center">
                        <h3 class="text-subtitle-1 font-weight-bold">
                          Photos to Select
                        </h3>
                        <v-spacer></v-spacer>
                        <v-btn
                          x-small
                          outlined
                          class="mr-2"
                          color="error"
                          @click="reportsSelected = []"
                          >Cancel</v-btn
                        >
                        <v-btn
                          x-small
                          color="primary"
                          @click="handleReportsToSend"
                        >
                          Add Selected Photos
                        </v-btn>
                      </div>
                      <div class="reports-container">
                        <div v-for="(type, i) in typesTasks" :key="i">
                          <task-section
                            v-if="dialog"
                            :type-task="type"
                            :reports-selected="reportsSelected"
                            :order="order"
                            @report-selected="handleSelectReport($event)"
                          />
                        </div>
                        <div>
                          <bids-section
                            :bids="bidsFormatted"
                            :reports-selected="reportsSelected"
                            :order-id="order.id"
                            @report-selected="handleSelectReport($event)"
                          />
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-overlay :value="loading">
                <v-progress-circular
                  indeterminate
                  size="64"
                ></v-progress-circular>
              </v-overlay>
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
                class="mr-1"
                v-bind="attrs"
                v-on="on"
                @click="downloadItem(item)"
              >
                <v-icon small color="secondary"> mdi-tray-arrow-down </v-icon>
              </v-btn>
            </template>
            <span>Download Photos</span>
          </v-tooltip>

          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                x-small
                class="mr-1"
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
    </div>
    <SlideShow
      :list="reportsForSlideShow"
      :show="showImagesSlides"
      :from-bids="true"
      title="Report"
      type="images"
      :index-selected="indexOfImage"
      @update-report="handleUpdateLocalReport"
      @close="showImagesSlides = false"
    />
    <v-dialog
      v-model="dialogDelete"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="elevation-0">
        <v-toolbar color="primary" dense>
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pt-10 pb-10 text-center">
          <span class="text-body-1">
            Confirm that you want to remove this bid.
          </span>
        </v-card-text>
        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn class="mr-4" color="error" outlined @click="closeDelete">{{
            $t('cancel')
          }}</v-btn>
          <v-btn
            class="mr-4"
            :loading="loading"
            color="secondary"
            @click="deleteItemConfirm"
            >{{ $t('delete') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showBidsHistory" scrollable max-width="1200px">
      <bids-history
        :property-id="order.propertyId"
        :order-id="order.id"
        :wo-number="order.woNumber"
        @save="save"
        @close="showBidsHistory = !showBidsHistory"
      />
    </v-dialog>

    <v-dialog
      v-if="!loading"
      v-model="showReportsDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-download
        v-if="showReportsDownload"
        :local-reports="reportsToSend"
        :title="bidSelected.title || newBid.title"
        :type="bidSelected.title || newBid.title"
        type-report="GeneralReports"
        :from-oos="false"
        :from-bids="true"
        @close="showReportsDownload = false"
      ></reports-download>
    </v-dialog>

    <v-dialog
      v-if="!loading"
      v-model="showReportsAllDownload"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <reports-all-download
        v-if="showReportsAllDownload"
        :reports="reportsByAllDownload"
        :wo="order.woNumber"
        :bids="bids"
        @close="showReportsAllDownload = false"
      ></reports-all-download>
    </v-dialog>
  </div>
</template>

<script>
import TaskSection from './TaskSection.vue'
import BidsHistory from './BidsHistory.vue'
import BidsSection from './BidsSection.vue'
import SlideShow from '~/components/misc/SlideShow.vue'
import ReportsDownload from '~/components/oos/taskContent/download/ReportsDownload.vue'
import ReportsAllDownload from '~/components/oos/taskContent/download/ReportsAllDownload.vue'

export default {
  name: 'BidsComp',
  components: {
    TaskSection,
    SlideShow,
    BidsHistory,
    ReportsDownload,
    ReportsAllDownload,
    BidsSection,
  },
  props: { order: { type: Object, default: () => ({}) } },
  data() {
    return {
      loading: false,
      editedIndex: -1,
      dialog: false,
      search: '',
      showSearch: false,
      headers: [
        { text: '#', value: 'position' },
        { text: this.$t('title'), value: 'title' },
        {
          text: 'Alternative Titles',
          value: 'alternativeTitles',
          width: '20%',
        },
        { text: 'Qty', value: 'qty' },
        { text: 'Contractor Price', value: 'contractorPrice' },
        { text: 'Total', value: 'totalContractorPrice' },
        { text: 'Client Price', value: 'clientPrice' },
        { text: 'Total', value: 'totalClientPrice' },
        { text: this.$t('description'), value: 'desc', width: '20%' },
        {
          text: this.$t('actions'),
          value: 'actions',
          sortable: false,
          width: '5%',
        },
      ],
      rulesPrice: [
        (v) => !!v || this.$t('priceRequired'),
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesQty: [
        (v) => !!v || 'Qty is required',
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      newBid: {
        title: '',
        desc: '',
        qty: '',
        contractorPrice: '',
        clientPrice: '',
        alternativeTitles: [{ ceTitle: '', code: '', price: '' }],
        observations: '',
      },
      editedItem: {
        title: '',
        desc: '',
        contractorPrice: '',
        clientPrice: '',
        qty: '',
        alternativeTitles: [{ ceTitle: '', code: '', price: '' }],
        observations: '',
      },
      defaultItem: {
        title: '',
        desc: '',
        contractorPrice: '',
        clientPrice: '',
        qty: '',
        alternativeTitles: [{ ceTitle: '', code: '', price: '' }],
        observations: '',
      },
      bids: [],
      reportsSelected: [],
      reportsToSend: [],
      indexOfImage: 0,
      showImagesSlides: false,
      reportsForSlideShow: [],
      reportsInBidBd: [],
      reportsDelete: [],
      reportsNew: [],
      typesTasks: ['inspections', 'workToDos', 'allowables', 'bids'],
      dialogDelete: false,
      orders: [],
      loadingOrder: false,
      bidsTemplates: [],
      showBidsHistory: false,
      loadingSend: false,
      showReportsDownload: false,
      bidSelected: {},
      showReportsAllDownload: false,
      reportsByAllDownload: [],
    }
  },
  computed: {
    bidsFormatted() {
      return this.bids.map((b) => ({
        ...b,
        totalClientPrice: b.qty * b.clientPrice,
        totalContractorPrice: b.qty * b.contractorPrice,
      }))
    },
  },
  watch: {
    dialog(val) {
      val || this.close()
      if (this.editedIndex === -1) {
        this.cleanUp()
      }
    },
    reportsInBidBd(val) {
      this.reportsToSend = JSON.parse(JSON.stringify(val))
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  created() {
    this.initialize()
    this.get_bidsTemplates()
  },
  methods: {
    async initialize() {
      this.loading = true
      try {
        const _items = await this.$store.dispatch('order/get_bids', {
          orderId: this.order.id,
        })
        this.bids = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async get_reportsBid(bidId) {
      this.loading = true
      try {
        const _items = await this.$store.dispatch('order/get_reportsBid', {
          orderId: this.order.id,
          bidId,
        })
        this.reportsInBidBd = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async get_bidsTemplates() {
      this.loading = true
      try {
        const _items = await this.$store.dispatch(
          'admin/orders/get_templatesForLoanTypes',
          {
            type: 'bids',
            loanType: this.order.loanType,
          }
        )
        this.bidsTemplates = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleCancel() {
      this.close()
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
      this.cleanUp()
    },
    cleanUp() {
      if (!this.$refs.newBid) return
      this.$refs.newBid.resetValidation()
      this.$nextTick(() => {
        this.newBid = JSON.parse(JSON.stringify(this.defaultItem))

        this.reportsSelected = []
        this.reportsToSend = []
        this.reportsInBidBd = []
        this.reportsDelete = []
        this.reportsNew = []
        this.bidSelected = {}
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
    async handleBid() {
      if (!this.$refs.newBid.validate()) {
        return
      }
      this.loadingSend = true
      try {
        const objectToSend = {
          ...this.newBid,
          observations: this.newBid.observations || '',
          orderId: this.order.id,
          propertyId: this.order.propertyId,
          woNumber: this.order.woNumber,
        }
        await this.$store.dispatch(`order/add_bid`, {
          objectToSend,
          orderId: this.order.id,
          reports: this.reportsToSend,
        })
        this.loadingSend = false
        this.cleanUp()
        this.$mainAlertSuccess('Success! Bid added')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.loadingSend = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
      this.save()
    },
    async handleUpdateBid() {
      if (!this.$refs.newBid.validate()) {
        return
      }

      const _reportsNew = []
      if (this.reportsNew.length) {
        let _positionMax = this.reportsInBidBd.length + 1
        this.reportsNew.forEach((report) => {
          _reportsNew.push({ ...report, position: _positionMax })
          _positionMax++
        })
      }

      this.loadingSend = true
      try {
        const objectToSend = {
          ...this.newBid,
        }
        await this.$store.dispatch(`order/update_bid`, {
          objectToSend,
          orderId: this.order.id,
          bidId: this.editedItem.id,
          reportsDelete: this.reportsDelete,
          reportsNew: _reportsNew,
        })
        this.cleanUp()
        this.$mainAlertSuccess('Success! Bid updated')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      } finally {
        this.loadingSend = false
      }
      this.save()
    },
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.bids[this.editedIndex], this.editedItem)
      } else {
        this.bids.push(this.editedItem)
      }
      this.initialize()
      if (this.editedIndex !== -1) {
        this.close()
      }
    },
    editItem(item) {
      this.editedIndex = this.bidsFormatted.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.newBid.title = this.editedItem.title
      this.newBid.desc = this.editedItem.desc
      this.newBid.qty = this.editedItem.qty || ''
      this.newBid.contractorPrice = this.editedItem.contractorPrice || ''
      this.newBid.clientPrice = this.editedItem.clientPrice || ''
      this.newBid.observations = this.editedItem.observations || ''
      this.newBid.alternativeTitles = JSON.parse(
        JSON.stringify(this.editedItem.alternativeTitles)
      ) || [{ ceTitle: '', code: '', price: '' }]
      this.get_reportsBid(item.id)
      this.bidSelected = item
      this.dialog = true
    },
    downloadItem(item) {
      this.bidSelected = item
      this.get_reportsBid(item.id)
      this.showReportsDownload = true
    },
    async get_reportsBids() {
      this.loading = true
      try {
        const _items = await this.$store.dispatch('order/get_reportsBids', {
          orderId: this.order.id,
          bids: this.bids,
        })
        this.reportsByAllDownload = _items || []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    downloadAll() {
      this.get_reportsBids()
      this.showReportsAllDownload = true
    },

    handleSelectReport(event) {
      if (event.event.shift) {
        if (event.event.select) {
          event.reportsSelect.forEach((element) => {
            this.reportsSelected.push(element)
            this.reportsNew.push(element)
          })
        } else {
          const _reportsSelect = []
          const _reportsNew = []
          event.reportsSelect.forEach((element) => {
            _reportsSelect.push(element)
            _reportsNew.push(element)
          })
          this.reportsSelected = _reportsSelect
          this.reportsNew = _reportsNew
        }
      } else {
        if (event.event.select) {
          this.reportsSelected.push(event.report)
          this.reportsNew.push(event.report)
          return
        }
        const indexOfReport = this.reportsSelected.findIndex(
          (r) => r.id === event?.report?.id
        )

        if (indexOfReport < 0) {
          return
        }
        this.reportsSelected.splice(indexOfReport, 1)
      }
    },
    handleDeleteReport(report) {
      const indexOfPic = this.reportsToSend
        .map((p) => p.codeName)
        .indexOf(report.codeName)

      this.reportsToSend.splice(indexOfPic, 1)

      const index = this.reportsNew
        .map((p) => p.codeName)
        .indexOf(report.codeName)

      this.reportsNew.splice(index, 1)

      if (this.reportsInBidBd.length) {
        const _reportsInBid = this.reportsInBidBd.map((r) => r.codeName)
        if (_reportsInBid.includes(report.codeName)) {
          this.reportsDelete.push(report)
        }
      }
    },
    handleReportsToSend() {
      this.reportsToSend = this.reportsToSend.concat(this.reportsSelected)
      this.reportsSelected = []
    },
    handleShowSlideShow(reports, index) {
      this.reportsForSlideShow = reports
      this.indexOfImage = index
      this.showImagesSlides = true
    },
    zoomHover(event, report) {
      const elementImg = event.target
      const box = elementImg.getBoundingClientRect()
      const position = JSON.parse(JSON.stringify(box))
      this.$store.commit('set_lupaOptions', { url: report.url, position })
      this.$store.commit('set_showLupa', true)
    },
    zoomLeave(event, id) {
      this.$store.commit('set_showLupa', false)
    },
    deleteItem(item) {
      this.editedIndex = this.bidsFormatted.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    async deleteItemConfirm() {
      this.loading = true
      const objectDelete = this.bidsFormatted[this.editedIndex]
      try {
        await this.$store.dispatch('order/delete_bid', {
          objectDelete,
          orderId: this.order.id,
        })
        this.bidsFormatted.splice(this.editedIndex, 1)
        this.bids.splice(this.editedIndex, 1)
        this.$mainAlertSuccess('Success! Bid deleted')
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
        this.closeDelete()
      }
    },
    handleBidTitle(event) {
      if (!event) return
      const indexOf = this.bidsTemplates.map((i) => i.id).indexOf(event.id)
      if (indexOf === -1) return
      const item = this.bidsTemplates[indexOf]
      if (item && typeof item === 'object') {
        this.newBid.title = item.title
        this.newBid.desc = item.desc
        this.newBid.qty = item.qty || ''
        this.newBid.contractorPrice = item.contractorPrice || ''
        this.newBid.clientPrice = item.clientPrice || ''
        this.newBid.alternativeTitles = item.alternativeTitles || [
          { ceTitle: '', code: '', price: '' },
        ]
        this.newBid.observations = item.observations || ''
      }
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
    handleBidceTitle(event) {
      if (!event) return

      if (typeof event === 'object') {
        this.newBid.ceTitle = event.ceTitle
        this.newBid.code = event.code
        this.newBid.price = event.price
      }
    },
    handleUpdateLocalReport(report) {
      const idx = this.reportsToSend.findIndex((r) => r.id === report.id)
      if (idx === -1) return
      this.reportsToSend.splice(idx, 1, report)
    },
  },
}
</script>

<style lang="scss" scoped>
.table-data {
  height: calc(100% - 125px);
}
.previews {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  flex-wrap: wrap;
  .preview {
    width: 95px;
    height: 95px;
    padding: 0.5em;
    padding-left: 0;
    padding-bottom: 0;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .delete-icon {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
.reports-container {
  overflow-y: auto;
  position: absolute;
  inset: 0;
  top: 45px;
}
.form-container {
  overflow-y: auto;
  position: absolute;
  inset: 0;
}
.col {
  position: relative;
}
.row {
  align-items: stretch;
  height: 100%;
}
.container-placard {
  --bgColor: #000;
  position: absolute;
  z-index: 1;
  bottom: 0;
  .placard-text {
    border-radius: 0 0 0 5px;
    background-color: var(--bgColor);
    font-size: 10px;
    color: #fff;
  }
}
</style>
