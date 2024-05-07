<template>
  <div class="add-orders | d-flex flex-column">
    <!-- <v-container fluid> -->
    <v-tabs
      v-model="tabSelected"
      centered
      background-color="secondary"
      class="flex-grow-0"
      dense
      fixed-tabs
    >
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="ma-3 ml-4"
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click.stop="$router.go(-1)"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('back') }}</span>
      </v-tooltip>
      <v-spacer></v-spacer>
      <v-tab> {{ $t('newOrder') }} </v-tab>
      <v-tab> {{ $t('orderBatch') }} </v-tab>
      <v-spacer></v-spacer>
    </v-tabs>
    <v-tabs-items v-model="tabSelected" tag class="flex-grow-1 h-100">
      <v-tab-item class="tab-item | h-100">
        <AddSingleOrder />
      </v-tab-item>
      <v-tab-item class="tab-item | h-100">
        <AddNewOrders></AddNewOrders>
      </v-tab-item>
    </v-tabs-items>
    <!-- </v-container> -->
  </div>
</template>

<script>
import AddNewOrders from '~/components/orders/AddNewOrders.vue'
import AddSingleOrder from '~/components/orders/AddSingleOrder.vue'

export default {
  name: 'AddOrders',
  components: { AddNewOrders, AddSingleOrder },
  layout: 'dash',
  data() {
    return {
      tabSelected: 0,
    }
  },
}
</script>

<style lang="scss" scoped>
.add-orders {
  position: absolute;
  width: 100%;
  height: 100%;
}
.tab-item {
  overflow-y: auto;
}
</style>
