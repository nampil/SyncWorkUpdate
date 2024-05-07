<template>
  <v-dialog
    v-model="dialog"
    max-width="1000px"
    :overlay="false"
    scrollable
    transition="dialog-transition"
    :persistent="localNeedToSave"
  >
    <v-card class="elevation-0">
      <v-toolbar color="secondary" dense>
        <v-btn icon dark @click="handleCancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-toolbar-title class="d-flex aling-center">
          {{ formTitle }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            v-if="!itemToEdit"
            ref="botonSave"
            text
            :loading="loading"
            @click="handleAddTaskTemplate()"
          >
            {{ $t('send') }}
          </v-btn>
          <v-btn
            v-else
            ref="botonUpdate"
            text
            :loading="loading"
            @click="handleUpdateTaskTemplate()"
          >
            {{ $t('update') }}
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <v-container class="mt-3">
          <v-form ref="newItemForInvoiceForm">
            <v-row>
              <v-col cols="12" md="10">
                <v-text-field
                  v-model="newItem.title"
                  :label="$t('title')"
                  :rules="titleRules"
                  autofocus
                  dense
                  hide-details="auto"
                  outlined
                  @keydown.enter.exact.prevent
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-switch
                  v-model="newItem.active"
                  class="switch-active | ma-0"
                  :label="$t('active')"
                  hide-details="auto"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="12">
                <v-textarea
                  v-model="newItem.desc"
                  :label="$t('descTemplate')"
                  dense
                  rows="2"
                  hide-details="auto"
                  outlined
                ></v-textarea>
              </v-col>

              <v-col cols="12" md="4">
                <v-combobox
                  v-model="newItem.unit"
                  :label="$t('unit')"
                  outlined
                  :items="units"
                  item-text="title"
                  item-value="id"
                  :rules="rulesUnit"
                  dense
                  clearable
                  hide-details="auto"
                  @keydown.enter.exact.prevent
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row v-for="(priceOption, idx) in newItem.prices" :key="idx">
              <v-col cols="12" md="4">
                <v-select
                  v-model="priceOption.client"
                  :items="clientsFormatted"
                  :label="$t('client')"
                  outlined
                  clearable
                  :rules="rulesClient"
                  hide-details="auto"
                  dense
                  @change="priceOption.loanTypes = []"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="priceOption.loanTypes"
                  :items="loanTypesFormatted[idx]"
                  :label="$t('loanTypes')"
                  outlined
                  :rules="rulesLoanTypes"
                  multiple
                  clearable
                  hide-details="auto"
                  dense
                  validate-on-blur
                  :disabled="!priceOption.client"
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="priceOption.price"
                  :label="$t('price')"
                  :rules="rulesPrice"
                  prefix="$"
                  outlined
                  dense
                  hide-details="auto"
                  @keydown.enter.exact.prevent
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2" class="d-flex gap-8">
                <v-btn
                  v-if="idx === newItem.prices.length - 1"
                  color="primary"
                  icon
                  @click="handleAddPriceOption"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn
                  v-if="newItem.prices.length > 1"
                  color="error"
                  icon
                  @click="handleDeletePriceOption(idx)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <AddWorkTemplate
              :item-to-edit="itemToEdit"
              :closing="closing"
              :task-title="newItem.title"
              @work-template-id="newItem.workTemplateId = $event"
              @cleared="closing = false"
            />
          </v-form>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import AddWorkTemplate from '~/components/admin/templates/workToDos/AddWorkTemplate.vue'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export default {
  name: 'AddItemsForInvoicesModal',
  components: { AddWorkTemplate },
  props: {
    show: { type: Boolean, default: false },
    formTitle: { type: String, default: '' },
    itemToEdit: { type: [Object, null], default: null },
  },
  data() {
    return {
      dialog: false,
      loading: false,
      closing: false,
      newItem: {
        title: '',
        prices: [{ price: '', client: '', loanTypes: [], id: null }],
        desc: '',
        active: true,
        unit: '',
        workTemplateId: '',
      },
      titleRules: [(v) => !!v || this.$t('titleRequired')],
      descRules: [(v) => !!v || this.$t('descriptionRequired')],
      rulesPrice: [
        (v) => !!v || this.$t('priceRequired'),
        (v) =>
          /^[0-9]{1,10}([.][0-9]{1,10})?$/.test(v) ||
          this.$t('onlyNumbersRequired'),
      ],
      rulesUnit: [(v) => !!v || this.$t('unitIsRequired')],
      rulesClient: [(v) => !!v || this.$t('clientIsRequired')],
      rulesLoanTypes: [
        (v) => (!!v && v.length !== 0) || this.$t('loanTypesIsRequired'),
      ],
      clients: [],
      units: [],
    }
  },
  computed: {
    workTemplate() {
      return this.$store.state.admin.itemForInvoiceTemplates.workTemplate
    },
    originalWorkTemplate() {
      return this.$store.state.admin.itemForInvoiceTemplates
        .originalWorkTemplate
    },
    workTemplateValidation() {
      return this.$store.state.admin.itemForInvoiceTemplates
        .workTemplateValidation
    },
    localNeedToSave() {
      if (this.itemToEdit && !this._.isEqual(this.newItem, this.itemToEdit)) {
        return true
      }

      if (
        this.originalWorkTemplate &&
        !this._.isEqual(this.originalWorkTemplate, this.workTemplate)
      ) {
        return true
      }

      const baseItem = {
        title: '',
        prices: [{ price: '', client: '', loanTypes: [], id: null }],
        desc: '',
        active: true,
        unit: '',
        workTemplateId: '',
      }

      if (!this.itemToEdit && !this._.isEqual(this.newItem, baseItem)) {
        return true
      }

      return false
    },
    validateForm() {
      if (!this.itemToEdit && !this.localNeedToSave) {
        return true
      } else if (this.itemToEdit && !this.localNeedToSave) {
        return true
      }
      return false
    },
    clientsFormatted() {
      return this.clients.map((c) => c.title)
    },
    loanTypesFormatted() {
      return this.newItem.prices.map((priceOption) => {
        const indexOf = this.clients
          .map((o) => o.title)
          .indexOf(priceOption.client)
        if (indexOf > -1) {
          return this.clients[indexOf].loanTypes
        }
        return []
      })
    },
  },
  watch: {
    itemToEdit: {
      handler(val) {
        if (val) {
          this.newItem = structuredClone(val)
        }
      },
      immediate: true,
      deep: true,
    },
    show(val) {
      if (this.dialog !== val) {
        this.dialog = val
      }
    },
    dialog(val) {
      if (!val && this.show) {
        this.handleCancel()
      }
    },
  },
  mounted() {
    this.initialize()
  },
  methods: {
    async initialize() {
      this.loading = true
      try {
        const _type = TEMPLATES_TYPES.units
        const _clients = await this.$store.dispatch('admin/orders/get_clients')
        this.clients = _clients && _clients.length ? _clients : []
        const _items = await this.$store.dispatch(
          'admin/orders/get_tasks_templates_active',
          _type
        )
        this.units = _items && _items.length ? [..._items] : []
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleDeletePriceOption(idx) {
      this.newItem.prices.splice(idx, 1)
    },
    handleAddPriceOption() {
      this.newItem.prices.push({
        price: '',
        client: '',
        loanTypes: [],
        id: null,
      })
    },
    handleCancel() {
      this.closing = true
      this.newItem = {
        title: '',
        prices: [{ price: '', client: '', loanTypes: [], id: null }],
        desc: '',
        active: true,
        unit: '',
        workTemplateId: '',
      }
      this.$refs.newItemForInvoiceForm.resetValidation()
      this.$emit('close')
    },
    async handleAddTaskTemplate() {
      if (!this.$refs.newItemForInvoiceForm.validate()) {
        return
      }

      const isValid = await this.$store.dispatch(
        'admin/itemForInvoiceTemplates/validate_workTemplate'
      )

      if (!isValid) {
        return
      }

      try {
        this.loading = true
        await this.$store.dispatch(
          'admin/itemForInvoiceTemplates/add_itemForInvoiceTemplate',
          { newItem: this.newItem }
        )
        this.loading = false
        this.handleCancel()
        this.$mainAlertSuccess(this.$t('successTemplateAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.loading = false
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },
    async handleUpdateTaskTemplate() {
      if (!this.$refs.newItemForInvoiceForm.validate()) {
        return
      }
      if (this.validateForm) {
        this.$mainAlertInfo('There are no changes to update')
        return
      }

      const isValid = await this.$store.dispatch(
        'admin/itemForInvoiceTemplates/validate_workTemplate'
      )

      if (!isValid) {
        return
      }
      try {
        this.loading = true
        await this.$store.dispatch(
          'admin/itemForInvoiceTemplates/update_itemForInvoiceTemplate',
          { newItem: this.newItem }
        )
        this.loading = false
        this.handleCancel()
        this.$mainAlertSuccess(this.$t('successTemplateAdded'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error updating the template: ', error)
        this.loading = false
        this.$mainAlertError(
          'There was an error updating the template, please try again later. If the problem persists, contact support'
        )
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
