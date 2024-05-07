<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-width="200"
    offset-y
  >
    <!-- eslint-disable-next-line -->
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon dark v-bind="attrs" v-on="on">
        <v-icon>mdi-alert-circle-outline</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-text>
        <div class="d-flex align-center gap-8">
          <v-icon color="red">mdi-alert-circle-outline</v-icon>

          <span>{{ reason }}</span>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: 'ErrorReason',
  props: {
    reason: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      menu: false,
    }
  },
}
</script>

<style lang="scss" scoped></style>
