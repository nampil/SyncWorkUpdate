<template>
  <v-overlay>
    <v-card color="secondary" max-width="90%" width="300px" dark>
      <v-card-text>
        {{ $t('pleaseStandBy') }}
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
          width=""
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-overlay>
</template>

<script>
export default {
  name: 'MiscLoader',
}
</script>

<style lang="scss" scoped></style>
