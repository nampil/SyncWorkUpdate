<template>
  <v-card class="d-flex flex-column overflow-hidden">
    <v-toolbar dark color="secondary" class="flex-grow-0" dense>
      <v-btn icon dark @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('Orders Templates') }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn ref="btnSave" dark text @click.stop="handleSave">
          {{ $t('save') }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-card-text class="pa-8 flex-grow-1 overflow-y-auto">
      <div class="order-template-form mb-4">
        <v-form ref="formOrderSeteada" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="title"
                item-text="title"
                :label="$t('title')"
                :items="ordersTemplates"
                dense
                :rules="rules"
                outlined
                autofocus
                hide-details="auto"
                @input="handleOrderTitle($event)"
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
          </v-row>
        </v-form>
      </div>

      <div v-for="(type, j) in jobsTypes" :key="j" class="mb-2">
        <span v-if="orderSelected[type.type].length" class="sub-title">{{
          $t(type.title)
        }}</span>
        <div v-for="task in orderSelected[type.type]" :key="task.id">
          <v-icon size="14" color="grey"
            >mdi-arrow-right-drop-circle-outline
          </v-icon>
          {{ task.title }}
        </div>
      </div>
    </v-card-text>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-card>
</template>

<script>
import { JOB_TYPES, ORDER_STATUS } from '@/utils/dictionaries'
export default {
  props: {
    order: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      ordersTemplates: [],
      loading: false,
      title: '',
      orderSelected: { workToDos: [], inspections: [], allowablesPools: [] },
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      jobsTypes: [
        { title: 'workToDos', type: 'workToDos' },
        { title: 'inspections', type: 'inspections' },
        { title: 'allowablesPools', type: 'allowablesPools' },
      ],
    }
  },
  computed: {
    jobTasksTemplatesInState() {
      return this.$store.state.order.jobTasksTemplatesInState
    },
    localNeedToSave() {
      if (!this.title) {
        return true
      }
      return false
    },
  },
  watch: {
    localNeedToSave(val) {
      this.$emit('update-persistent', !val)
    },
  },
  mounted() {
    if (this.jobTasksTemplatesInState.orders) {
      this.order.client !== this.jobTasksTemplatesInState.orders.client ||
      this.order.loanType !== this.jobTasksTemplatesInState.orders.loanType ||
      !this.jobTasksTemplatesInState.orders.templates ||
      (this.jobTasksTemplatesInState.orders.templates &&
        !this.jobTasksTemplatesInState.orders.templates.length)
        ? this.getOrdersTemplates()
        : (this.ordersTemplates =
            this.jobTasksTemplatesInState.orders.templates)
    }
  },

  methods: {
    async getOrdersTemplates() {
      this.loading = true
      try {
        const _items = await this.$store.dispatch('order/get_ordersTemplates', {
          order: this.order,
        })
        this.ordersTemplates = _items && _items.length ? [..._items] : []
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    async handleSave() {
      if (!this.$refs.formOrderSeteada.validate()) {
        return
      }
      this.loading = true
      const _tasks = [
        ...this.orderSelected.workToDos,
        ...this.orderSelected.inspections,
        ...this.orderSelected.allowablesPools,
      ]
      try {
        const jobTasksToSend = _tasks.map((task) => {
          return {
            title: task.title,
            desc: task.desc,
            position: task.position,
            ...(task.type !== JOB_TYPES.inspections && {
              needProcessTimes: task.needProcessTimes,
            }),
            requirements: task.requirements,
            itemsForInvoices: task.itemsForInvoices || [],
            materialsOrTools: task.materialsOrTools,
            ...(task.type === JOB_TYPES.allowablesPools && {
              maxValue: task.maxValue,
              approved: !task.needSupervisorApproval,
              needSupervisorApproval: task.needSupervisorApproval,
            }),
            type: task.type,
            ...(task.pictures && { pictures: [...task.pictures] }),
          }
        })

        const notifyContractors =
          this.order.status.trim().toLowerCase() ===
          ORDER_STATUS.inField.toLowerCase()
        await this.$store.dispatch('order/add_jobTasks', {
          jobTasksToSend,
          order: this.order,
          notifyContractors,
          ...(notifyContractors && {
            contractors: this.order.contractorsUids,
          }),
        })
        this.$mainAlertSuccess(this.$t('taskAdded'))
        this.$emit('close')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleOrderTitle(event) {
      if (!event) {
        return
      }
      const indexOf = this.ordersTemplates.map((i) => i.id).indexOf(event.id)
      if (indexOf === -1) {
        return
      }
      const order = this.ordersTemplates[indexOf]

      if (order && typeof order === 'object') {
        this.orderSelected.workToDos = order.workToDos
        this.orderSelected.inspections = order.inspections
        this.orderSelected.allowablesPools = order.allowablesPools
      }
    },
    handleClose() {
      this.loading = false
      this.$emit('update-persistent', false)
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
.sub-title {
  font-size: 1.25rem;
}
</style>
