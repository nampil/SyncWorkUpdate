<template>
  <div v-if="allowables?.length || allowablesPools?.length" class="taskParent">
    <div class="d-flex align-center">
      <h3 class="info--text mb-2">
        {{ $t('allowables') }}
      </h3>
      <v-spacer></v-spacer>
      <p class="ma-0">
        ${{ allowablesPriceSum }} / ${{ allowablesPoolsPriceSum }}
      </p>
    </div>
    <p v-if="allowables?.length" class="ma-0 mb-1 text--accent">
      {{ $t('tasksPerformedFromAllowables') }}
    </p>
    <div
      v-for="(task, i) in allowablesFormatted"
      :key="i"
      class="task-wrapper | rounded mb-4"
    >
      <task-content
        class="task-content"
        :task="task"
        :order-id="order.id"
        :order="order"
        :wo="`${order.woNumber}`"
        :max-value="allowablesPoolsPriceSum - allowablesPriceSum"
      ></task-content>
    </div>

    <p v-if="allowablesPools?.length" class="ma-0 mb-1">
      {{ $t('allowablesTasks') }}
    </p>

    <div
      v-for="ap in allowablesPools"
      :key="ap.id"
      class="allowable-pool-wrapper | mb-4"
    >
      <allowable-pool-cdp
        :allowable-pool="ap"
        :order="order"
        :max-value="allowablesPoolsPriceSum - allowablesPriceSum"
      ></allowable-pool-cdp>
    </div>
  </div>
</template>

<script>
import TaskContent from '@/components/oos/taskContent/taskContent.vue'
import AllowablePoolCdp from '@/components/oos/allowablesSection/AllowablePoolCdp.vue'

export default {
  name: 'AllowablesSection',
  components: {
    TaskContent,
    AllowablePoolCdp,
  },
  props: {
    orderR: { type: [Object, null], default: null },
  },
  computed: {
    order() {
      return this.$store.state.oos.order.order
    },

    allowables() {
      if (!this.$store.state.oos.order.order) return []
      return this.$store.state.oos.order.allowables
        .map((allowable) => {
          return {
            ...allowable,
            type: 'allowables',
          }
        })
        .sort((a, b) => {
          return a.position > b.position ? 1 : -1
        })
    },
    allowablesFormatted() {
      return this.allowables
        .map((allowable) => allowable)
        .sort((a, b) => {
          return a.position > b.position ? 1 : -1
        })
    },
    allowablesPools() {
      return this.$store.state.oos.order.allowablesPools || []
    },
    allowablesPriceSum() {
      if (!this.allowables.length) return 0
      return this.allowables
        .reduce((acc, val) => {
          const items = val.itemsForInvoices || []
          const value = items.reduce((ac, item) => {
            const price = parseFloat(item.price)
            const qty = item.qty || 1
            const product = price * qty

            return ac + product
          }, 0)

          return acc + value
        }, 0)
        .toFixed(2)
    },
    allowablesPoolsPriceSum() {
      if (!this.allowablesPools.length) return 0
      return this.allowablesPools
        .reduce((acc, ap) => {
          return acc + parseFloat(ap.maxValue)
        }, 0)
        .toFixed(2)
    },
  },
}
</script>

<style lang="scss" scoped></style>
