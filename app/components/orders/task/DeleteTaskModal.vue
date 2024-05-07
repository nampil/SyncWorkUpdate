<template>
  <v-card class="elevation-0">
    <v-toolbar color="primary" dense>
      <v-toolbar-title class="d-flex aling-center">
        <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
        <span class="ma-0 text-h5 white--text">{{
          $t('alertTitle')
        }}</span></v-toolbar-title
      >
    </v-toolbar>
    <v-card-text class="pt-7 pb-5 text-center">
      <span class="text-body-1"> {{ $t('alertTextTask') }}</span>
    </v-card-text>

    <v-card-actions class="d-flex justify-end pa-4">
      <v-btn
        ref="botonClose"
        class="mr-4"
        color="error"
        dense
        outlined
        @click="$emit('close')"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn class="mr-4" dense color="secondary" @click="$emit('delete')">{{
        $t('delete')
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped></style>
