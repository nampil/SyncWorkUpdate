<template>
  <div
    :class="[
      'property-history-drawer drawer-wrapper overflow-hidden',
      { open: open },
    ]"
  >
    <transition>
      <v-navigation-drawer
        v-if="open"
        v-model="open"
        right
        width="400"
        absolute
      >
        <v-toolbar
          class="elevation-0 info--text text"
          color="rgba(128, 128, 128, 0.067)"
          dense
        >
          <v-toolbar-title class="">{{
            $t('propertyHistory')
          }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <!-- TODO: Addd filter, sort, find btn's here -->
        </v-toolbar>
        <v-divider></v-divider>

        <PropertyHistory :order="order" class="list | h-100" />
      </v-navigation-drawer>
    </transition>
  </div>
</template>

<script>
import PropertyHistory from './PropertyHistory.vue'
export default {
  name: 'PropertyHistoryDrawer',
  components: { PropertyHistory },
  props: {
    order: { type: Object, default: () => ({}) },
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      open: false,
    }
  },
  computed: {},
  watch: {
    show: {
      handler(val) {
        this.open = val
      },
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer-wrapper {
  width: 0;
  transition: width 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  &.open {
    width: 400px;
    flex-shrink: 0;
    transition: width 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
.list {
  overflow-y: auto;
  background-color: var(--clr-bg-alt);
}
::v-deep .v-navigation-drawer__content,
.list {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
.list::-webkit-scrollbar {
  display: none; /* Chrome */
}
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.v-enter-active,
.v-leave-active {
  transition: all 250ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.v-enter,
.v-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
