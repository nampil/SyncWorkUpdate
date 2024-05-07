<template>
  <div class="container-action-details | text-center">
    <v-menu
      offset-y
      min-width="150px"
      left
      nudge-bottom="20"
      transition="slide-y-transition"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          text
          x-small
          :disabled="!ordersSelected.length"
          v-bind="attrs"
          v-on="on"
        >
          <span
            :class="
              ordersSelected.length ? 'white--text' : 'btn-action-disabled'
            "
          >
            <v-icon small color="white"> mdi-file-edit-outline </v-icon>
            {{ $t('actions') }}</span
          >
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$emit('actions-events', 'set_status')">
          <v-list-item-title
            ><v-icon class="mr-2 mb-1" dense>mdi-file-document-alert</v-icon>
            {{ $t('setStatus') }}</v-list-item-title
          >
        </v-list-item>
        <!-- <v-divider></v-divider>
        <v-list-item @click="$emit('actions-events', 'archive')">
          <v-list-item-title
            ><v-icon class="mr-2 mb-1" dense>mdi-archive</v-icon
            >{{
              ordersSelected &&
              ordersSelected.length &&
              !ordersSelected[0].archive
                ? $t('Archive')
                : $t('Unarchive')
            }}</v-list-item-title
          >
        </v-list-item> -->

        <v-divider></v-divider>
        <v-list-item @click="$emit('actions-events', 'set_category')">
          <v-list-item-title
            ><v-icon class="mr-2 mb-1" dense>mdi-flag</v-icon
            >{{ $t('setCategory') }}</v-list-item-title
          >
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="$emit('actions-events', 'set_client')">
          <v-list-item-title
            ><v-icon class="mr-2 mb-1" dense>mdi-account-tie-hat</v-icon>
            {{ $t('setClient') }}</v-list-item-title
          >
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="$emit('actions-events', 'selectContractors')">
          <v-list-item-title
            ><v-icon class="mr-2 mb-1" dense
              >mdi-account-box-multiple-outline</v-icon
            >{{ $t('selectContractor') }}</v-list-item-title
          >
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="$emit('actions-events', 'selectProcessor')">
          <v-list-item-title
            ><v-icon class="mr-2 mb-1" dense>mdi-account-box-outline</v-icon
            >Select Processor</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'ActionDetails',
  props: {
    ordersSelected: { type: Array, default: () => [] },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.theme--light.v-btn.v-btn--disabled .v-icon,
.theme--dark.v-btn.v-btn--disabled .v-icon,
.btn-action-disabled {
  color: white !important;
  opacity: 0.7;
}
</style>
