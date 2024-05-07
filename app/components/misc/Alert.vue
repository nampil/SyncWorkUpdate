<template>
  <v-snackbar
    v-model="showAlert"
    :timeout="timeout"
    :color="color"
    :top="top"
    :left="left"
    :right="right"
    :bottom="bottom"
    app
    @input="handleInput"
  >
    <strong class="grey--text text--darken-4">{{ text }}</strong>
    <!-- eslint-disable-next-line  -->
    <template v-slot:action="{ attrs }">
      <v-btn icon text v-bind="attrs" @click.stop="showAlert = false">
        <v-icon color="grey darken-4">mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'MainAlert',
  computed: {
    ...mapState({
      text: (state) => state.alert.text,
      color: (state) => state.alert.color,
      timeout: (state) => state.alert.timeout,
      top: (state) => state.alert.top,
      left: (state) => state.alert.left,
      right: (state) => state.alert.right,
      bottom: (state) => state.alert.bottom,
    }),

    showAlert: {
      get() {
        return this.$store.state.alert.showAlert
      },
      set(payload) {
        this.$store.commit('alert/set_showAlert', payload)
      },
    },
  },
  methods: {
    handleInput(e) {},
  },
}
</script>

<style lang="scss" scoped></style>
