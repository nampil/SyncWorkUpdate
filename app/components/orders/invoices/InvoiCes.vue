<template>
  <v-card class="container-invoice elevation-0">
    <v-toolbar dense color="terciary" elevation="0">
      <v-col cols="6" md="6">
        <v-toolbar-title rounded>{{ $t('client') }}</v-toolbar-title>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="3" md="2" sm="3">
        <h4>Total: {{ clientTotal }}</h4>
      </v-col>
      <v-col cols="3" md="2">
        <h4
          v-if="payments.length"
          :class="{
            'red--text':
              clientPayment == 'PARTIALY PAID' ||
              clientPayment == 'PARCIALMENTE PAGADO',
            'green--text': clientPayment == 'PAID' || clientPayment == 'PAGADO',
          }"
        >
          {{ clientPayment }}
        </h4>
      </v-col>
    </v-toolbar>

    <v-toolbar dense elevation="0" outlined rounded class="titles-item">
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

    <v-card-text elevation="1" outlined>
      <v-form ref="formClient" class="task-form mb-8" lazy-validation>
        <v-row
          v-for="(item, i) in localInvoice.items"
          :key="i"
          class="una-linea"
        >
          <v-col cols="3" md="3">
            <v-combobox
              v-model="item.itemDescription"
              :items="itemsForInvoicesBdFormatted"
              item-text="text"
              outlined
              dense
              autofocus
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
                      (item.price * item.qty * localInvoice.discount) / 100
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
              label="Invoice Completed by OOS"
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
              <v-date-picker v-model="localInvoice.completeDate" scrollable>
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

          <v-col cols="2" md="2">
            <v-text-field
              v-model="localInvoice.invoiceNumber"
              :label="$t('clientInvoince') + '#'"
              outlined
              dense
              required
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="3" md="3">
            <v-checkbox
              v-model="localInvoice.completedProcessor"
              label="Invoice Sent to Client by Processors"
              dense
              @click="handleDateProcessor"
            ></v-checkbox>
          </v-col>
        </v-row>

        <v-row v-if="localInvoice.completedProcessor" dense>
          <v-col cols="3" md="3">
            <v-menu
              ref="menuSentDate"
              :close-on-content-click="false"
              :return-value.sync="localInvoice.sentDate"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="sentDateFormatted"
                  :label="$t('sentToClientDate')"
                  readonly
                  outlined
                  dense
                  required
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="localInvoice.sentDate" scrollable>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.menuSentDate.save(localInvoice.sentDate)"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="3" md="3">
            <v-menu
              ref="menuSentTime"
              :close-on-content-click="false"
              :nudge-right="5"
              :return-value.sync="localInvoice.sentTime"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="sentTimeFormatted"
                  :label="$t('sentToClientTime')"
                  readonly
                  outlined
                  dense
                  required
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-model="localInvoice.sentTime"
                format="ampm"
                full-width
                @click:minute="$refs.menuSentTime.save(localInvoice.sentTime)"
              ></v-time-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-form>

      <div class="d-flex mb-10">
        <v-spacer></v-spacer>

        <v-btn
          class="mr-4"
          small
          color="error"
          outlined
          @click="cancelInvoice"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn small color="secondary" @click="saveInvoice">{{
          $t('save')
        }}</v-btn>
      </div>
      <v-divider></v-divider>

      <!--    Tabla de Payments   -->
      <v-row class="espacios-entre-row">
        <v-col cols="12" md="12">
          <v-data-table
            :headers="headers"
            :items="paymentsFormatted"
            hide-default-footer
            sort-by="amount"
            class="elevation-0"
            :loading="loadingPayments"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:top>
              <v-toolbar flat dense color="terciary">
                <v-toolbar-title>{{
                  $t('clientPaymentReceived')
                }}</v-toolbar-title>
                <v-spacer></v-spacer>

                <v-dialog
                  v-model="dialog"
                  persistent
                  :overlay="false"
                  max-width="500px"
                  transition="dialog-transition"
                >
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn small color="secondary" v-bind="attrs" v-on="on">
                      {{ $t('addPayment') }}
                    </v-btn>
                  </template>
                  <v-form ref="formPayment" class="task-form" lazy-validation>
                    <v-card class="elevation-0">
                      <v-toolbar color="primary" dense>
                        <v-btn icon @click.stop="close">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>

                        <v-toolbar-title> {{ formTitle }}</v-toolbar-title>

                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                          <v-btn
                            v-if="
                              formTitle === 'Add Payment' ||
                              formTitle === 'Agregar Pago'
                            "
                            text
                            :loading="loadingPayment"
                            @click="save"
                          >
                            {{ $t('save') }}</v-btn
                          >
                          <v-btn
                            v-if="
                              formTitle === 'Edit Payment' ||
                              formTitle === 'Editar Pago'
                            "
                            text
                            :loading="loadingPayment"
                            @click="save"
                          >
                            {{ $t('update') }}</v-btn
                          >
                        </v-toolbar-items>
                      </v-toolbar>

                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col
                              cols="12"
                              sm="6"
                              md="4"
                              class="margen-dialogo"
                            >
                              <v-menu
                                ref="menuPayments"
                                :close-on-content-click="false"
                                :return-value.sync="editedItem.date"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <!-- eslint-disable-next-line -->
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="editedItem.date"
                                    :label="$t('date')"
                                    readonly
                                    :rules="rulesDatePayment"
                                    outlined
                                    dense
                                    required
                                    v-bind="attrs"
                                    v-on="on"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="editedItem.date"
                                  scrollable
                                >
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    text
                                    color="primary"
                                    @click="
                                      $refs.menuPayments.save(editedItem.date)
                                    "
                                  >
                                    OK
                                  </v-btn>
                                </v-date-picker>
                              </v-menu>
                            </v-col>
                            <v-col
                              cols="12"
                              sm="6"
                              md="4"
                              class="margen-dialogo"
                            >
                              <v-text-field
                                v-model="editedItem.amount"
                                :label="$t('amount')"
                                prefix="$"
                                :rules="rulesAmount"
                                outlined
                                dense
                                hide-details="auto"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                              <v-text-field
                                v-model="editedItem.check"
                                label="Check#"
                                :rules="rulesCheck"
                                outlined
                                dense
                                hide-details="auto"
                                required
                              ></v-text-field>
                            </v-col>

                            <v-col cols="12" sm="12" md="12">
                              <v-textarea
                                v-model="editedItem.comment"
                                :label="$t('comment')"
                                outlined
                                dense
                                rows="3"
                                row-height="25"
                                hide-details="auto"
                                required
                              ></v-textarea>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-form>
                </v-dialog>
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
                <span> Edit Payment </span>
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
                <span>Delete Payment</span>
              </v-tooltip>
            </template>
            <!-- eslint-disable-next-line -->
            <template v-slot:footer>
              <v-toolbar dense color="terciary" flat>
                <v-col cols="6" md="6" class="space-footer">
                  <v-text-field
                    :prefix="$t('totalPayments') + ':'"
                    solo
                    readonly
                    dense
                    flat
                    :value="stdPayment.amount"
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="6" md="6" class="space-footer">
                  <v-text-field
                    :prefix="$t('openBalance') + ':'"
                    solo
                    readonly
                    dense
                    flat
                    :value="stdPayment.balance"
                  ></v-text-field>
                </v-col>
              </v-toolbar>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card-text>

    <v-dialog
      v-model="dialogDelete"
      persistent
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
        <v-card-text class="pt-10 text-center">
          <span class="text-body-1">{{ $t('alertTextPayment') }} </span>
        </v-card-text>
        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn
            class="mr-2"
            color="error"
            small
            outlined
            @click="closeDelete"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn
            class=""
            color="secondary"
            small
            :loading="loadingPayment"
            @click="deleteItemConfirm"
            >{{ $t('delete') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmModalClientInvoiceTotal
      :show="showConfirmModal"
      :client-invoice-total="clientTotal"
      @cancel="showConfirmModal = !showConfirmModal"
      @confirm="handleConfirm({ confirmed: $event })"
    ></ConfirmModalClientInvoiceTotal>

    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-card>
</template>
<script>
import { mapState } from 'vuex'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import ConfirmModalClientInvoiceTotal from './ConfirmModalClientInvoiceTotal'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export default {
  name: 'InvoicesComp',
  components: { ConfirmModalClientInvoiceTotal },
  props: {
    order: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      loading: false,
      loadingPayment: false,
      loadingPayments: false,
      dialog: false,
      dialogDelete: false,
      rulesDatePayment: [(v) => !!v || this.$t('dateRequired')],
      rulesAmount: [
        (v) => !!v || this.$t('amountRequired'),
        (v) =>
          /^[0-9]{1,10}([.,][0-9]{1,4})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesCheck: [(v) => !!v || this.$t('checkRequired')],
      rulesItem: [(v) => !!v || this.$t('itemRequired')],
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
      payments: [],
      headers: [
        {
          text: this.$t('date'),
          align: 'start',
          sortable: false,
          value: 'date',
        },
        { text: this.$t('amount'), value: 'amount' },
        { text: 'Check #', value: 'check' },
        { text: this.$t('comment'), value: 'comment' },
        { text: this.$t('enteredBy'), value: 'enteredByStr' },
        { text: this.$t('actions'), value: 'actions', sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        date: null,
        amount: null,
        check: null,
        comment: null,
        enteredBy: null,
      },
      defaultItem: {
        date: null,
        amount: null,
        check: null,
        comment: null,
        enteredBy: null,
      },
      menuPayment: false,

      showConfirmModal: false,
      confirmedClientInvoiceTotal: false,
    }
  },
  computed: {
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
    sentDateFormatted() {
      if (!this.localInvoice.sentDate) return
      const [year, month, day] = this.localInvoice.sentDate.split('-')
      return `${month}-${day}-${year}`
    },
    sentTimeFormatted() {
      if (!this.localInvoice.sentTime) return
      const [hours, mins] = this.localInvoice.sentTime.split(':')
      const _hours = hours % 12 === 0 ? 12 : hours % 12
      return `${_hours}:${mins}`
    },
    paymentsFormatted() {
      if (!this.payments.length) {
        return []
      }

      return this.payments.map((payment) => {
        let str = ''

        str +=
          payment.enteredBy.name + ' ' + payment.enteredBy.lastName.charAt(0)

        if (payment.enteredBy.enteredAt) {
          const date = payment.enteredBy.enteredAt.toDate()

          str += ' ' + date.toLocalString()
        }

        return {
          ...payment,
          enteredByStr: str,
        }
      })
    },
    local_needToSave() {
      // Comparar los valores de dos objetos o arrays de forma recursiva
      // metodo que nos da plugin lodash
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
    clientPayment() {
      let amount = 0.0
      this.payments.forEach((element) => {
        amount += parseFloat(element.amount)
      })
      amount.toFixed(2)
      if (parseFloat(this.clientTotal - amount) <= 0) {
        return this.$t('paidPayment')
      } else {
        return this.$t('partialyPaidPayment')
      }
    },
    stdPayment() {
      let amount = 0.0
      this.payments.forEach((element) => {
        amount += parseFloat(element.amount)
      })
      amount.toFixed(2)
      return {
        amount: '$' + amount,
        balance: '$' + parseFloat(this.clientTotal - amount),
      }
    },
    formTitle() {
      return this.editedIndex === -1
        ? this.$t('addPayment')
        : this.$t('editPayment')
    },
    ...mapState('auth', {
      userProfile: (state) => state.user.profile,
    }),
    needToSave: {
      get() {
        return this.$store.state.needToSave
      },
      set(val) {
        this.$store.commit('set_needToSave', val)
      },
    },
    itemsForInvoicesBd() {
      return this.$store.state.admin.itemForInvoiceTemplates
        .itemForInvoiceTemplates
    },

    itemsForInvoicesBdFormatted() {
      const tasks = [...this.order.workToDos, ...this.order.allowables]
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

    clientList() {
      return this.$store.state.clientsList
    },
  },

  watch: {
    // TODO: Añadir needToSave general
    local_needToSave: {
      handler(val) {
        this.needToSave = val
      },
      immediate: true,
    },

    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
    baseInvoice(val) {
      this.localInvoice = JSON.parse(JSON.stringify(val))
    },
  },

  mounted() {
    if (this.order && this.order.id) {
      this.getInvoice()
      this.getPayments()
    }
    this.initializeItemsForInvoices()
    this.initializeClients()
    this.handleDiscount()
  },

  methods: {
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
    handleDateProcessor() {
      if (!this.localInvoice.completedProcessor) {
        this.localInvoice.sentDate = ''
        this.localInvoice.sentTime = ''
        return
      }

      this.localInvoice.sentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 10)
      this.localInvoice.sentTime = `${new Date(
        Date.now()
      ).getHours()}:${new Date(Date.now()).getMinutes()}`
    },
    async initializeItemsForInvoices() {
      if (this.itemsForInvoicesBd.length) {
        return
      }

      this.loading = true
      try {
        await this.$store.dispatch(
          'admin/orders/get_templatesItemsInvoicesForClient',
          {
            type: TEMPLATES_TYPES.itemsForInvoices,
            client: this.order.client,
            loanTypes: [this.order.loanType],
          }
        )
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    async getInvoice() {
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
    async getPayments() {
      this.loadingPayments = true

      try {
        const _payments = await this.$store.dispatch(
          'order/get_payments',
          this.order.id
        )

        this.payments = _payments && _payments.length ? [..._payments] : []

        this.loadingPayments = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loadingPayments = false
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
    handleConfirm({ confirmed }) {
      this.showConfirmModal = false
      if (!confirmed) {
        this.$mainAlertError('Amount does not match the invoice')
        return
      }
      this.confirmedClientInvoiceTotal = true
      this.saveInvoice()
    },
    async saveInvoice() {
      if (!this.local_needToSave) {
        this.$mainAlertInfo('No changes to save')
        return
      }

      if (this.validateSent && !this.confirmedClientInvoiceTotal) {
        this.showConfirmModal = true
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
      // array payments error por funcion servertimestand
      const send = {
        orderId: this.order.id,
        localInvoice: {
          items: this.localInvoice.items,

          ...(this.localInvoice.invoiceNumber && {
            invoiceNumber: this.localInvoice.invoiceNumber,
          }),

          complete: this.localInvoice.complete,
          completedProcessor: this.localInvoice.completedProcessor,

          ...(this.localInvoice.completeDate &&
            this.localInvoice.complete && {
              completeDate: this.localInvoice.completeDate,
              completedBy:
                this.validateCompleted || !this.localInvoice.completedBy
                  ? this.userProfile.uid
                  : this.localInvoice.completedBy,
            }),
          ...(this.localInvoice.completeTime &&
            this.localInvoice.complete && {
              completeTime: this.localInvoice.completeTime,
            }),
          ...(this.localInvoice.completeTimestamp &&
            this.localInvoice.complete && {
              completeTimestamp: this.localInvoice.completeTimestamp,
            }),

          ...(this.localInvoice.sentTime &&
            this.localInvoice.completedProcessor && {
              sentTime: this.localInvoice.sentTime,
            }),
          ...(this.localInvoice.sentDate &&
            this.localInvoice.completedProcessor && {
              sentDate: this.localInvoice.sentDate,
              sentBy:
                this.validateSent || !this.localInvoice.sentBy
                  ? this.userProfile.uid
                  : this.localInvoice.sentBy,
            }),
          ...(this.localInvoice.sentTimestamp &&
            this.localInvoice.completedProcessor && {
              sentTimestamp: this.localInvoice.sentTimestamp,
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
        this.loading = true
        await this.$store.dispatch('order/add_invoice', send)

        this.$mainAlertSuccess(this.$t('successInvoiceAdded'))
        this.$store.commit('order/set_invoice', {
          ...structuredClone(this.localInvoice),
        })
      } catch (error) {
        this.$mainAlertError(error, this.$t('oopsProblem'))
      } finally {
        this.confirmedClientInvoiceTotal = false
        this.loading = false
        this.$emit('close')
      }
    },
    cancelInvoice() {
      this.localInvoice = structuredClone(this.baseInvoice)
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
      /* const index = this.localInvoice.items.map((j) => j.id).indexOf(key) */
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

    editItem(item) {
      this.editedIndex = this.payments.map((p) => p.id).indexOf(item.id)

      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    async deleteItem(item) {
      try {
        this.loadingPayment = true
        await this.$store.dispatch('order/delete_payment', {
          orderId: this.order.id,
          paymentId: item.id,
        })
        this.editedIndex = this.payments.map((p) => p.id).indexOf(item.id)
        this.editedItem = Object.assign({}, item)
        this.loadingPayment = false
        this.dialogDelete = true
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loadingPayment = false
      }
    },

    deleteItemConfirm() {
      this.payments.splice(this.editedIndex, 1)
      this.$mainAlertSuccess(this.$t('successPaymentDelete'))
      this.closeDelete()
    },

    close() {
      this.dialog = false
      if (this.$refs.formPayment) {
        this.$refs.formPayment.reset()
      }

      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      if (this.$refs.formPayment) {
        this.$refs.formPayment.reset()
      }

      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async updatePayment() {
      try {
        // Añadir el paymen a la base de datos

        this.loadingPayment = true

        const objToSend = {
          ...this.editedItem,
          enteredBy: {
            ...this.userProfile,
            updatedAt: serverTimestamp(),
          },
        }

        await this.$store.dispatch('order/update_payment', {
          objToSend,
          orderId: this.order.id,
        })

        Object.assign(this.payments[this.editedIndex], this.editedItem)

        this.$mainAlertSuccess(this.$t('successPaymentUpdate'))

        return
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loadingPayment = false
      }
    },
    async addPayment() {
      try {
        // Añadir el paymen a la base de datos
        this.loadingPayment = true

        const objToSend = {
          ...this.editedItem,
          enteredBy: {
            ...this.userProfile,
            createdAt: serverTimestamp(),
          },
        }

        const paymentSent = await this.$store.dispatch('order/add_payment', {
          objToSend,
          orderId: this.order.id,
        })

        this.payments.push({
          ...paymentSent,
        })

        this.$mainAlertSuccess(this.$t('successPaymentAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loadingPayment = false
      }
    },

    async save() {
      if (!this.$refs.formPayment.validate()) {
        return
      }
      if (this.editedIndex > -1) {
        await this.updatePayment()
        this.close()
        return
      }
      this.addPayment()
      this.close()
    },
    handleTaskTitle(event, i) {
      if (!event) return

      if (event && typeof event === 'object') {
        this.localInvoice.items[i].itemDescription = event.title
        this.localInvoice.items[i].price = event.price
      }
    },
  },
}
</script>

<styles lang="scss" scoped>
.container-invoice {
  margin-bottom: 2rem;
}
// .titles-item {
// }
.btn-icono {
  margin-top: 0.3rem;
}
.espacios-entre-row {
  margin-top: 1rem;
}
.espacios-entre-text {
  margin: 0.2rem 0 0;
}
.discount-space {
  margin-top: -1rem;
  margin-bottom: -2.5rem;
}
.una-linea {
  margin-bottom: -2rem;
}
.checkbox-invoice {
  margin-bottom: -1.5rem;
}
.space-footer {
  margin: 1.7rem 0 0 0;
}

.margen-dialogo {
  margin-bottom: -1.4rem;
}
</styles>
