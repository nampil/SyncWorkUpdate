<template>
  <div class="h-100 d-flex flex-column">
    <HomeToolbar />
    <orders-table></orders-table>
  </div>
</template>

<script setup>
import OrdersTable from '@@/components/home/OrdersTable.vue'
import HomeToolbar from '../components/home/homeToolbar/homeToolbar.vue'
</script>

<style lang="scss" scoped></style>
