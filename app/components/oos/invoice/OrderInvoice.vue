<template>
  <!-- v-click-outside="handleClickOutside" -->
  <div
    ref="orderInvoice"
    class="order-invoice"
    :class="{ minimazed: minimize }"
  >
    <div
      :class="[
        'invoice-toolbar | flex-grow-0 d-flex px-2 align-center white--text',
        { minimized: minimize },
      ]"
      @mousedown="handleDrag"
    >
      <v-btn icon small dark @click="handleMinimize">
        <v-icon small>mdi-minus</v-icon>
      </v-btn>

      <div v-if="!minimize" class="invoice-title ml-4 d-flex flex-column">
        <span class="text-subtitle-2"> Invoice </span>
        <span class="text-caption accent--text">
          WO#: {{ order.woNumber }}
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon small dark @click="handleClose">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="content-wrapper flex-grow-1">
      <div
        v-if="loading"
        class="pa-4 my-4 d-flex align-center rounded justify-center"
      >
        <v-progress-circular indeterminate size="24"></v-progress-circular>
      </div>

      <div
        v-if="!loading"
        class="h-100 d-flex flex-column justify-space-between"
      >
        <v-toolbar dense elevation="0" class="titles-item flex-grow-0">
          <v-row>
            <v-col cols="3" md="3">
              <span>{{ $t('itemDescription') }}</span>
            </v-col>
            <v-col cols="1" md="1">
              <span>{{ $t('qty') }}</span>
            </v-col>
            <v-col cols="2" md="2">
              <span>{{ $t('price') }}</span>
            </v-col>
            <v-col cols="2" md="2">
              <span>Net</span>
            </v-col>
            <v-col cols="2" md="2">
              <span>Total</span>
            </v-col>
            <v-col cols="2" md="2">
              <span>{{ $t('flatFee') }}</span>
            </v-col>
          </v-row>
        </v-toolbar>
        <div class="content | flex-grow-1">
          <v-card-text elevation="1" outlined>
            <v-form ref="formClient" class="mb-10" lazy-validation>
              <v-row
                v-for="(item, i) in localInvoice.items"
                :key="i"
                class="una-linea"
              >
                <v-col cols="3" md="3">
                  <v-combobox
                    v-model="item.itemDescription"
                    :items="itemsForInvoicesBdFormatted"
                    outlined
                    dense
                    item-text="text"
                    :label="$t('item')"
                    :rules="rulesItem"
                    @input="handleTaskTitle($event.value, i)"
                  ></v-combobox>
                </v-col>
                <v-col cols="1" md="1">
                  <v-text-field
                    v-model="item.qty"
                    outlined
                    dense
                    @blur="validateQty(i)"
                  ></v-text-field>
                </v-col>
                <v-col cols="2" md="2">
                  <v-text-field
                    v-model="item.price"
                    prefix="$"
                    outlined
                    dense
                    required
                    @blur="validatePrice(i)"
                  ></v-text-field>
                </v-col>
                <v-col cols="2" md="2">
                  <v-text-field
                    prefix="$"
                    :value="
                      !item.fee &&
                      !isNaN(item.price) &&
                      !isNaN(item.qty) &&
                      localInvoice?.discount
                        ? (
                            item.price * item.qty -
                            (item.price * item.qty * localInvoice.discount) /
                              100
                          ).toFixed(2)
                        : (item.price * item.qty).toFixed(2)
                    "
                    solo
                    readonly
                    dense
                  ></v-text-field>
                </v-col>

                <v-col cols="2" md="2"
                  ><v-text-field
                    prefix="$"
                    :value="
                      !isNaN(item.price) && !isNaN(item.qty)
                        ? (item.price * item.qty).toFixed(2)
                        : 0
                    "
                    solo
                    readonly
                    dense
                  ></v-text-field
                ></v-col>

                <v-col cols="1" md="1">
                  <v-checkbox
                    v-model="item.fee"
                    :label="$t('fee')"
                    dense
                  ></v-checkbox>
                </v-col>
                <v-col cols="1" md="1">
                  <v-tooltip open-delay="600" content-class="small" top>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="btn-icono"
                        small
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="deleterLine(i)"
                      >
                        <v-icon small color="red">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Delete Line</span>
                  </v-tooltip>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="6" md="5" sm="5" lg="6">
                  <v-btn small color="dark secondary" @click="addLine">
                    {{ $t('addLine') }}
                  </v-btn>

                  <v-row class="espacios-entre-row">
                    <v-col cols="10" lg="12">
                      <v-textarea
                        v-model="localInvoice.desc"
                        :label="$t('description')"
                        auto-grow
                        outlined
                        rows="4"
                        row-height="25"
                        dense
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="2" md="3" sm="3" lg="2">
                  <v-row class="espacios-entre-text">
                    <v-col cols="12" md="12">
                      <span>{{ $t('clientSubTotal') }}</span>
                    </v-col>
                  </v-row>
                  <v-row class="espacios-entre-text">
                    <v-col cols="12" md="12">
                      <span>{{ $t('clientDiscount') }}</span>
                    </v-col>
                  </v-row>
                  <v-row class="espacios-entre-text">
                    <v-col cols="12" md="12">
                      <span>{{ $t('clientTotal') }}</span>
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="2" md="2">
                  <v-text-field
                    prefix="$"
                    solo
                    readonly
                    :value="subTotal"
                    dense
                  ></v-text-field>
                  <v-row class="discount-space">
                    <v-col cols="12" md="12">
                      <v-text-field
                        v-model="localInvoice.discount"
                        prefix="%"
                        outlined
                        dense
                        @blur="validateDiscount"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="12">
                      <v-text-field
                        prefix="$"
                        solo
                        readonly
                        :value="clientTotal"
                        dense
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="3" md="3">
                  <v-checkbox
                    v-model="localInvoice.complete"
                    label="Invoice Completed OOS"
                    dense
                    @click="handleDateOOS"
                  ></v-checkbox>
                </v-col>
              </v-row>

              <v-row v-if="localInvoice.complete" dense>
                <v-col cols="3" md="3">
                  <v-menu
                    ref="menuCompleteDate"
                    :close-on-content-click="false"
                    :return-value.sync="localInvoice.completeDate"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="completeDateFormatted"
                        :label="$t('completeDate')"
                        readonly
                        outlined
                        dense
                        required
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="localInvoice.completeDate"
                      scrollable
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="
                          $refs.menuCompleteDate.save(localInvoice.completeDate)
                        "
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="3" md="3">
                  <v-menu
                    ref="menuCompleteTime"
                    :close-on-content-click="false"
                    :nudge-right="5"
                    :return-value.sync="localInvoice.completeTime"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="completeTimeFormatted"
                        :label="$t('completeTime')"
                        readonly
                        outlined
                        dense
                        required
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="localInvoice.completeTime"
                      format="ampm"
                      full-width
                      @click:minute="
                        $refs.menuCompleteTime.save(localInvoice.completeTime)
                      "
                    ></v-time-picker>
                  </v-menu>
                </v-col>
                <v-spacer></v-spacer>

                <v-col cols="3" md="3">
                  <v-text-field
                    v-model="localInvoice.invoiceNumber"
                    :label="$t('clientInvoince') + '#'"
                    outlined
                    dense
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
            <div class="d-flex">
              <v-spacer></v-spacer>
              <v-btn
                class="mr-4"
                small
                color="error"
                outlined
                @click="cancelInvoice"
                >{{ $t('cancel') }}</v-btn
              >
              <v-btn
                class="mr-4"
                small
                color="secondary"
                :loading="loadingSend"
                @click="handleSave"
                >{{ $t('save') }}</v-btn
              >
            </div>
          </v-card-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Timestamp } from 'firebase/firestore'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export default {
  name: 'OrderInvoice',
  props: {
    order: { type: Object, required: true },
    closing: { type: Boolean, default: false },
  },
  data() {
    return {
      rulesItem: [(v) => !!v || this.$t('itemRequired')],
      pos3: 0,
      pos4: 0,
      localInvoice: {
        items: [],
        invoiceNumber: '',
        complete: false,
        completeDate: '',
        completeTime: '',
        completeTimestamp: null,
        sentDate: '',
        sentTime: '',
        sentTimestamp: null,
        discount: 0,
        desc: '',
        completedProcessor: false,
      },
      loading: false,
      loadingSend: false,
    }
  },
  computed: {
    ...mapState('auth', {
      userProfile: (state) => state.user.profile,
    }),
    minimize: {
      get() {
        return this.$store.state.invoice.minimize
      },
      set(val) {
        this.$store.commit('invoice/set_minimize', val)
      },
    },
    posX: {
      get() {
        return this.$store.state.invoice.posX
      },
      set(val) {
        this.$store.commit('invoice/set_posX', val)
      },
    },
    posY: {
      get() {
        return this.$store.state.invoice.posY
      },
      set(val) {
        this.$store.commit('invoice/set_posY', val)
      },
    },
    subTotal() {
      let subtotal = 0.0

      this.localInvoice.items.forEach((element) => {
        subtotal += element.qty * element.price
      })
      if (!isNaN(subtotal)) {
        return subtotal.toFixed(2)
      } else {
        return 0
      }
    },
    clientTotal() {
      let subTotalFee = 0.0
      this.localInvoice.items.forEach((element) => {
        if (!element.fee) {
          subTotalFee += element.qty * element.price
        }
      })
      const desc = (this.localInvoice.discount * subTotalFee) / 100
      let ctotal = parseFloat(this.subTotal - desc).toFixed(2)
      ctotal = parseFloat(ctotal)
      if (!isNaN(ctotal)) {
        return ctotal.toFixed(2)
      } else {
        return 0
      }
    },
    local_needToSave() {
      const _baseInvoice = Object.assign({}, this.baseInvoice)
      delete _baseInvoice.updatedAt
      delete _baseInvoice.updatedBy
      delete _baseInvoice.createdAt
      delete _baseInvoice.completeTimestamp
      delete _baseInvoice.sentTimestamp

      const _localInvoice = Object.assign({}, this.localInvoice)
      delete _localInvoice.updatedBy
      delete _localInvoice.updatedAt
      delete _localInvoice.createdAt
      delete _localInvoice.completeTimestamp
      delete _localInvoice.sentTimestamp

      return !this._.isEqual(_baseInvoice, _localInvoice)
    },
    baseInvoice() {
      return this.$store.state.invoice.invoice
    },
    validateCompleted() {
      return (
        this.localInvoice.completeDate !== this.baseInvoice.completeDate ||
        this.localInvoice.completeTime !== this.baseInvoice.completeTime
      )
    },
    validateSent() {
      return (
        this.localInvoice.sentDate !== this.baseInvoice.sentDate ||
        this.localInvoice.sentTime !== this.baseInvoice.sentTime
      )
    },
    itemsForInvoicesBd() {
      return this.$store.state.admin.itemForInvoiceTemplates
        .itemForInvoiceTemplates
    },
    workToDos() {
      return this.$store.state.oos.order.workToDos
    },
    allowables() {
      return this.$store.state.oos.order.allowables
    },
    itemsForInvoicesBdFormatted() {
      const tasks = [...this.workToDos, ...this.allowables]
      const _items = tasks.map((t) => t.itemsForInvoices).flat(1)

      const arrayTasks = _items.map((i) => ({
        value: i,
        text: i.title,
      }))

      arrayTasks.push({ divider: true })

      const arrayItems = this.itemsForInvoicesBd.map((i) => ({
        value: i,
        text: i.title,
      }))

      return arrayTasks.concat(arrayItems)
    },
    completeDateFormatted() {
      if (!this.localInvoice.completeDate) return
      const [year, month, day] = this.localInvoice.completeDate.split('-')
      return `${month}-${day}-${year}`
    },
    completeTimeFormatted() {
      if (!this.localInvoice.completeTime) return
      const [hours, mins] = this.localInvoice.completeTime.split(':')
      const _hours = hours % 12 === 0 ? 12 : hours % 12
      return `${_hours}:${mins}`
    },
    clientList() {
      return this.$store.state.clientsList
    },
  },
  watch: {
    closing(val) {
      if (val) {
        this.minimize = true
      }
    },
    baseInvoice(val) {
      this.localInvoice = JSON.parse(JSON.stringify(val))
    },
    order() {
      this.handleDiscount()
    },
  },
  async beforeMount() {
    this.loading = true
    try {
      await this.$store.dispatch('invoice/getInvoices', this.order.id)
      this.loading = false
    } catch (error) {
      // eslint-disable-next-line
      console.log('error', error)
      this.$mainAlertError(this.$t('oopsProblem'))
      this.loading = false
    }
  },
  mounted() {
    const orderNoteEl = this.$refs.orderInvoice
    const box = orderNoteEl.getBoundingClientRect()
    if (this.posX <= 0 || this.posY <= 0) {
      const spacing = 16
      this.posX = spacing
      this.posY = window.innerHeight - box.height - spacing
    }
    orderNoteEl.style.left = this.posX + 'px'
    orderNoteEl.style.top = this.posY + 'px'
    this.checkBounds()
    this.initializeItemsForInvoices()
    this.initializeClients()
  },
  beforeDestroy() {
    this.$store.commit('invoice/flush_invoice')
  },

  methods: {
    async handleSave() {
      if (!this.local_needToSave) {
        this.$mainAlertInfo('No changes to save')
        return
      }

      let _dateComplete = null
      let _dateSent = null

      if (this.localInvoice.completeDate && this.localInvoice.completeTime) {
        _dateComplete = new Date(
          this.localInvoice.completeDate + ',' + this.localInvoice.completeTime
        )

        this.localInvoice.completeTimestamp = Timestamp.fromDate(_dateComplete)
      }
      if (this.localInvoice.sentDate && this.localInvoice.sentTime) {
        _dateSent = new Date(
          this.localInvoice.sentDate + ',' + this.localInvoice.sentTime
        )
        this.localInvoice.sentTimestamp = Timestamp.fromDate(_dateSent)
      }

      if (!this.$refs.formClient.validate()) {
        return
      }

      const send = {
        orderId: this.order.id,
        localInvoice: {
          items: this.localInvoice.items,
          ...(this.localInvoice.invoiceNumber && {
            invoiceNumber: this.localInvoice.invoiceNumber,
          }),
          complete: this.localInvoice.complete,
          ...(this.localInvoice.completeDate &&
            this.localInvoice.complete && {
              completeDate: this.localInvoice.completeDate,
            }),
          ...(this.localInvoice.completeTime &&
            this.localInvoice.complete && {
              completeTime: this.localInvoice.completeTime,
            }),
          ...(this.localInvoice.completeTimestamp &&
            this.localInvoice.complete && {
              completeTimestamp: this.localInvoice.completeTimestamp,
              completedBy:
                this.validateCompleted || !this.localInvoice.completedBy
                  ? this.userProfile.uid
                  : this.localInvoice.completedBy,
            }),

          discount: this.localInvoice.discount || 0,
          ...(this.localInvoice.desc && {
            desc: this.localInvoice.desc,
          }),
          orderId: this.order.id,
          state: this.order.state,
          client: this.order.client || '',
          customer: this.order.customer || '',
          orderStatus: this.order.status,
          createdAt: this.localInvoice.createdAt,
        },
      }
      try {
        this.loadingSend = true
        await this.$store.dispatch('order/add_invoice', send)
        this.$store.commit('order/set_invoice', {
          ...structuredClone(this.localInvoice),
        })
        this.$mainAlertSuccess(this.$t('successInvoiceAdded'))
      } catch (error) {
        this.$mainAlertError(error, this.$t('oopsProblem'))
      } finally {
        this.loadingSend = false
        this.$emit('close')
      }
    },
    cancelInvoice() {
      this.localInvoice = JSON.parse(JSON.stringify(this.baseInvoice))
    },
    handleClose() {
      this.$emit('close-notes')
    },
    handleMinimize(close) {
      this.minimize = !this.minimize

      setTimeout(() => {
        this.checkBounds()
      }, 500)
    },
    handleDrag(e) {
      e = e || window.event
      e.preventDefault()
      this.pos3 = e.clientX
      this.pos4 = e.clientY

      document.onmouseup = this.closeDragElement
      document.onmousemove = this.elementDrag
    },
    elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      this.posX = this.pos3 - e.clientX
      this.posY = this.pos4 - e.clientY
      this.pos3 = e.clientX
      this.pos4 = e.clientY

      const elmnt = this.$refs.orderInvoice

      const left = elmnt.offsetLeft - this.posX
      const top = elmnt.offsetTop - this.posY

      // set the element's new position:
      elmnt.style.top = top + 'px'
      elmnt.style.left = left + 'px'
      this.posY = top
      this.posX = left
    },
    closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null
      document.onmousemove = null
      this.checkBounds()
    },
    checkBounds() {
      const el = this.$refs.orderInvoice
      const rect = el.getBoundingClientRect()

      const bottomLimit = window.innerHeight
      const rightLimit = window.innerWidth

      if (rect.top < 0) {
        el.style.top = 0
      }
      if (rect.left < 0) {
        el.style.left = 0
      }
      if (rect.right > rightLimit) {
        el.style.left = rightLimit - rect.width + 'px'
      }
      if (rect.bottom > bottomLimit) {
        el.style.top = bottomLimit - rect.height + 'px'
      }
    },
    handleClickOutside() {
      if (this.minimize) return
      this.minimize = !this.minimize
    },
    addLine() {
      const newData = {
        qty: 1,
        price: parseFloat(0.0),
        fee: false,
        itemDescription: '',
      }
      this.localInvoice.items.push(newData)
      this.handleDiscount()
    },
    handleDiscount() {
      if (this.localInvoice.discount === 0) {
        for (let i = 0; i < this.clientList.length; i++) {
          const _client = this.clientList[i]
          if (
            this.order.client?.trim().toLowerCase() ===
              _client?.title.trim().toLowerCase() ||
            _client.loanTypes.includes(this.order.loanType)
          ) {
            this.localInvoice.discount = _client.discount || 0
          }
        }
      }
    },
    deleterLine(index) {
      this.localInvoice.items.splice(index, 1)
    },
    validatePrice(index) {
      if (
        !isNaN(this.localInvoice.items[index].price) &&
        this.localInvoice.items[index].price
      ) {
        this.localInvoice.items[index].price =
          this.localInvoice.items[index].price < 0
            ? (parseFloat(this.localInvoice.items[index].price) * -1).toFixed(2)
            : parseFloat(this.localInvoice.items[index].price).toFixed(2)

        this.localInvoice.items[index].price = parseFloat(
          this.localInvoice.items[index].price
        ).toFixed(2)
      } else {
        this.localInvoice.items[index].price = 0.0
      }
    },
    validateQty(index) {
      if (
        !isNaN(this.localInvoice.items[index].qty) &&
        this.localInvoice.items[index].qty
      ) {
        this.localInvoice.items[index].qty =
          this.localInvoice.items[index].qty < 0
            ? parseFloat(this.localInvoice.items[index].qty) * -1
            : parseFloat(this.localInvoice.items[index].qty)
      } else {
        this.localInvoice.items[index].qty = 1
      }
    },
    validateDiscount() {
      if (!isNaN(this.localInvoice.discount) && this.localInvoice.discount) {
        if (this.localInvoice.discount > 100) {
          this.localInvoice.discount = 100.0
        } else {
          this.localInvoice.discount =
            this.localInvoice.discount < 0
              ? (parseFloat(this.localInvoice.discount) * -1).toFixed(2)
              : parseFloat(this.localInvoice.discount).toFixed(2)
          this.localInvoice.discount = parseFloat(this.localInvoice.discount)
        }
      } else {
        this.localInvoice.discount = '0'
      }
    },
    async initializeItemsForInvoices() {
      if (this.itemsForInvoicesBd.length) {
        return
      }
      try {
        await this.$store.dispatch(
          'admin/orders/get_templatesItemsInvoicesForClient',
          {
            type: TEMPLATES_TYPES.itemsForInvoices,
            client: this.order.client,
            loanTypes: [this.order.loanType],
          }
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async initializeClients() {
      if (this.clientList.length) {
        return
      }
      try {
        await this.$store.dispatch('get_clientsList')
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)

        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleTaskTitle(event, i) {
      if (!event) {
        return
      }

      if (event && typeof event === 'object') {
        this.localInvoice.items[i].itemDescription = event.title
        this.localInvoice.items[i].price = event.price
      }
    },
    handleDateOOS() {
      if (!this.localInvoice.complete) {
        this.localInvoice.completeDate = ''
        this.localInvoice.completeTime = ''
        return
      }
      this.localInvoice.completeDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 10)
      this.localInvoice.completeTime = `${new Date(
        Date.now()
      ).getHours()}:${new Date(Date.now()).getMinutes()}`
    },
  },
}
</script>

<style lang="scss" scoped>
.order-invoice {
  position: fixed;
  resize: both;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
  display: flex;
  isolation: isolate;
  flex-direction: column;
  z-index: 9999;
  box-shadow: 0px 4px 12px rgba($color: #000000, $alpha: 0.2);
  transition-property: border-radius, max-width, max-height;
  transition-duration: 100ms, 300ms, 200ms;
  transition-delay: 150ms, 0ms;
  transition-timing-function: cubic-bezier(0.8, 0.01, 0.24, 1);

  &.minimazed {
    resize: none;
    max-width: 75px;
    max-height: 75px;
    min-height: 75px;
    min-width: 75px;
    border-radius: 75px;
  }
  .invoice-toolbar {
    background-color: var(--v-primary-base);
    z-index: 99;
    width: 100%;
    height: 100%;
    min-height: 42px;
    max-width: 800px;
    max-height: 42px;
    overflow: hidden;
    transition-property: min-height, max-width, max-height, border-radius,
      background-color;
    transition-duration: 300ms, 300ms;
    transition-delay: 150ms, 0ms;
    transition-timing-function: cubic-bezier(0.8, 0.01, 0.24, 1);
    cursor: move;

    &.minimized {
      max-width: 75px;
      max-height: 75px;
      min-height: 75px;
      min-width: 75px;
      border-radius: 75px;
      background-color: var(--v-info-base);
    }
  }

  .content-wrapper {
    background-color: var(--clr-bg-alt);
    flex-grow: 1;
    overflow: hidden;
    max-width: 100%;
    width: 800px;
  }
  .content {
    overflow-y: auto;
  }
}
</style>
