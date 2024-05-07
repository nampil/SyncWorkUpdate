<template>
  <div>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          small
          class=""
          :color="item.orderNew ? 'green lighten-2' : ''"
          v-bind="attrs"
          v-on="on"
        >
          mdi-bookmark
        </v-icon>
      </template>
      <span v-if="!item.orderNew">Old Order</span>
      <span v-else>New Order</span>
    </v-tooltip>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          x-small
          v-bind="attrs"
          v-on="on"
          @click.stop="$emit('set-on-hold')"
        >
          <v-icon small :color="item.onHold ? 'green lighten-2' : ''">
            mdi-timer
          </v-icon>
        </v-btn>
      </template>
      <span v-if="item.onHold">Remove on-hold from this order(s)</span>
      <span v-else>Set on-hold this order(s)</span>
    </v-tooltip>

    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          x-small
          v-bind="attrs"
          v-on="on"
          @click.stop="$emit('assig-order')"
        >
          <v-icon
            small
            class=""
            :color="item.assigned ? 'green lighten-2' : ''"
          >
            mdi-account-box-multiple
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('assignContractor(s)') }}</span>
    </v-tooltip>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          x-small
          v-bind="attrs"
          v-on="on"
          @click.stop="$emit('edit-order')"
        >
          <v-icon small class="" :color="item.edited ? 'green lighten-2' : ''">
            mdi-text-box-edit
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('editOrder') }}</span>
    </v-tooltip>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          x-small
          icon
          v-bind="attrs"
          v-on="on"
          @click.stop="$emit('archive-order')"
        >
          <v-icon small class="" :color="item.archive ? 'green lighten-2' : ''">
            mdi-archive
          </v-icon>
        </v-btn>
      </template>
      <span>Archive Order</span>
    </v-tooltip>

    <v-menu offset-y>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on: menu, attrs }">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on: tooltip }">
            <v-btn x-small icon v-bind="attrs" v-on="{ ...tooltip, ...menu }">
              <v-icon
                small
                class=""
                :color="
                  $getCategoryColor({
                    category: item.category,
                    className: true,
                  })
                "
              >
                mdi-flag
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('category') }}</span>
        </v-tooltip>
      </template>
      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="(option, index) in priorityItems"
            :key="index"
            :disabled="option.title === item.category"
            :class="{ active: option.title === item.category }"
            @click="handleSetPriority(option.title)"
          >
            <v-list-item-icon>
              <v-icon :color="option.color">mdi-flag</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ option.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { CATEGORY_OPTIONS } from '@/utils/dictionaries'
export default {
  name: 'TableActionItem',
  props: {
    item: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      CATEGORY_OPTIONS: null,
      priorityItems: [
        { title: CATEGORY_OPTIONS.ultraHigh, color: 'red darken-1' },
        { title: CATEGORY_OPTIONS.high, color: 'orange darken-1' },
        { title: CATEGORY_OPTIONS.median, color: 'yellow darken-1' },
        { title: CATEGORY_OPTIONS.low, color: 'green darken-1' },
        { title: CATEGORY_OPTIONS.veryLow, color: 'blue lighten-1' },
      ],
    }
  },
  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },

  methods: {
    handleSetPriority(priority) {
      this.$emit('priority-order', priority)
    },
  },
}
</script>

<style lang="scss" scoped>
.active {
  background-color: var(--v-secondary-base);
}
</style>
