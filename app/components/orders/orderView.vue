<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    max-height="600px"
    scrollable
    @click:outside="$emit('close')"
  >
    <v-card class="d-flex flex-column">
      <v-toolbar color="primary" class="flex-grow-0" dense>
        <div class="d-flex align-center">
          <span class="order-label mr-4">{{ order.label }}</span>
          <div class="">
            <h4 class="ma-0">
              {{ order.address }}
            </h4>
            <div class="text-subtitle-2 grey--text text--darken-3">
              WO#: {{ order.woNumber }}
            </div>
          </div>
        </div>

        <v-spacer></v-spacer>

        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="height: 600px">
        <v-list dense>
          <v-list-item v-for="(value, _key) in orderFormatted" :key="_key">
            <!-- <div class="item-content d-flex flex-wrap pt-8">
          <div v-for="(value, _key) in orderFormatted" :key="_key" class="item">
            <h5>{{ formatCamelCase(_key) }}</h5>
            <p class="ma-0">{{ value }}</p> -->
            <v-list-item-content>
              <v-list-item-title>
                {{ formatCamelCase(_key) }}</v-list-item-title
              >

              <v-list-item-subtitle v-if="_key === 'fohImg'">
                <img :src="value" alt="" class="foh-img"
              /></v-list-item-subtitle>
              <v-list-item-subtitle v-else> {{ value }}</v-list-item-subtitle>
            </v-list-item-content>
            <!-- </div>
        </div> -->
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'OrderView',
  props: {
    order: {
      type: Object,
      default: () => ({}),
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: false,
    }
  },
  computed: {
    orderFormatted() {
      const { label, ...order } = this.order
      return order
    },
  },
  watch: {
    show(val) {
      this.dialog = val
    },
  },
  methods: {
    formatCamelCase(text) {
      const result = text.replace(/([A-Z])/g, ' $1')
      const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
      return finalResult
    },
  },
}
</script>

<style lang="scss" scoped>
.order-label {
  display: inline-flex;
  padding: 10px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #ea4335;
  color: #fff;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.item-content {
  gap: 4px;
}
.item {
  padding-inline: 1rem;
  margin-block: 0.5rem;
}
.foh-img {
  width: 100%;
  max-width: 200px;
  height: auto;
}
</style>
