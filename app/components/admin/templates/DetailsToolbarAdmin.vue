<template>
  <div class="content-toolbar elevation-0 pa-2 pr-4 pl-4 d-flex align-center">
    <div>
      <v-btn
        v-for="(item, i) in itemsFormatted"
        :key="i"
        :to="item.to"
        x-small
        router
        exact
        class="mr-2"
        color="secondary elevation-0"
      >
        {{ item.title }}
      </v-btn>
    </div>

    <v-menu offset-y>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          x-small
          color="secondary"
          class="mr-2 elevation-0"
          v-bind="attrs"
          v-on="on"
        >
          {{ $t('templates') }}
          <v-icon class="ml-1" small> mdi-chevron-down </v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in templates"
          :key="index"
          :to="item.to"
          router
          exact
        >
          <v-list-item-title class="texto">
            <v-icon class="mr-2 mb-1" dense>{{ item.icon }}</v-icon
            >{{ $t(item.title) }}</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu v-if="isHightLevelAuth" offset-y>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          x-small
          color="secondary"
          class="mr-2 elevation-0"
          v-bind="attrs"
          v-on="on"
        >
          {{ $t('reports') }}
          <v-icon class="ml-1" small> mdi-chevron-down </v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in reports"
          :key="index"
          :to="item.to"
          router
          exact
        >
          <v-list-item-title class="texto">
            <v-icon class="mr-2 mb-1" dense>{{ item.icon }}</v-icon
            >{{ $t(item.title) }}</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    isHightLevelAuth() {
      return this.$store.getters['auth/isHighLevelAuth']
    },
    itemsFormatted() {
      return [
        {
          icon: 'mdi-apps',
          title: this.$t('home'),
          to: '/admin',
        },
        {
          icon: 'mdi-account-cog-outline',
          title: this.$t('users'),
          to: '/admin/users',
        },
      ]
    },
    templates() {
      const items = [
        {
          icon: 'mdi-clipboard-text-search',
          title: 'inspections',
          to: '/admin/templates/inspections',
        },
        // {
        //   icon: 'mdi-account-hard-hat',
        //   title: 'worksToDo',
        //   to: '/admin/templates/workstodo',
        // },
        {
          icon: 'mdi-hammer-screwdriver',
          title: 'materialsOrTools',
          to: '/admin/templates/materialsortools',
        },

        {
          icon: 'mdi-flag',
          title: 'orderCategories',
          to: '/admin/templates/ordercategories',
        },
        {
          icon: 'mdi-notebook-edit',
          title: 'jobNoteTypes',
          to: '/admin/templates/jobnotetypes',
        },
        {
          icon: 'mdi-account-multiple',
          title: 'clients',
          to: '/admin/templates/clients',
        },
        {
          icon: 'mdi-tag',
          title: 'itemsForInvoices',
          to: '/admin/templates/itemsforinvoices',
        },
        {
          icon: 'mdi-pencil-ruler',
          title: 'units',
          to: '/admin/templates/units',
        },
        {
          icon: 'mdi-card-account-details',
          title: 'departments',
          to: '/admin/templates/departments',
        },
        {
          icon: 'mdi-order-bool-descending',
          title: 'ordersTemplates',
          to: '/admin/templates/orders',
        },
        {
          icon: 'mdi-state-machine',
          title: 'orderStatus',
          to: '/admin/templates/orderstatus',
        },
        {
          icon: 'mdi-account-group',
          title: 'customers',
          to: '/admin/templates/customer',
        },
        {
          icon: 'mdi-offer',
          title: 'bids',
          to: '/admin/templates/bids',
        },
      ]
      return items
        .map((c) => c)
        .sort((a, b) => {
          return a.title > b.title ? 1 : -1
        })
    },
    reports() {
      const items = [
        {
          icon: 'mdi-invoice-list',
          title: 'invoices',
          to: '/admin/reports/invoices',
        },
      ]
      return items
        .map((c) => c)
        .sort((a, b) => {
          return a.title > b.title ? 1 : -1
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.content-toolbar {
  z-index: 5;
  min-height: 48px;
  background-color: var(--v-secondary-base);
}
</style>
