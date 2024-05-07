<template>
  <v-container class="order-general-info | pa-4">
    <v-row dense>
      <v-col cols="12" xl="4">
        <div class="img-container | d-flex aling-center justify-center">
          <img v-if="order.fohImg" :src="order.fohImg.url" alt="" />
          <v-icon v-else class="no-image-icon">mdi-image-outline</v-icon>
        </div>
      </v-col>
      <v-col cols="12" xl="8" class="text-caption">
        <p class="ma-0">
          <span class="info--text">WO#:</span> {{ order.woNumber }}
        </p>
        <p class="ma-0">
          <span class="info--text">{{ $t('address') }}:</span>
          {{ order.address }}, {{ order.city }} {{ order.county }} -
          {{ order.state }},
          {{ order.zip }}
        </p>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" class="info-col text-caption d-flex flex-wrap">
        <span class="info--text">{{ $t('client') }}:</span> {{ order.client }}
        <span class="info--text">{{ $t('loanType') }}:</span>
        {{ order.loanType || 'N/A' }}

        <span class="info--text">{{ $t('customer') }}:</span>
        {{ order.customer || 'N/A' }}

        <span class="info--text">{{ $t('dateDue') }}:</span>
        {{ $formatDate(order.dateDue, { time: true }) || 'N/A' }}

        <span class="info--text">{{ $t('workType') }}:</span>
        {{ order.workType || 'N/A' }}

        <span class="info--text">{{ $t('estimateCompletionDate') }}:</span>
        {{ order.estimatedCompleteDate || 'N/A' }}

        <span class="info--text">{{ $t('category') }}:</span>
        {{ order.category || 'N/A' }}
        <v-icon
          v-if="order.category"
          :color="
            $getCategoryColor({ category: order.category, className: true })
          "
          small
          >mdi-flag</v-icon
        >

        <span class="info--text">{{ $t('lockbox') }}:</span>
        {{ order.lockBox || 'N/A' }}

        <span class="info--text">{{ $t('keyCode') }}:</span>
        {{ order.keyCode || 'N/A' }}

        <span class="info--text">VPS:</span> {{ order.vps || 'N/A' }}
      </v-col>
    </v-row>
    <div>
      <div v-if="instructions?.length" class="instructions | mt-6">
        <h3 class="info--text">{{ $t('instructions') }}</h3>
        <div
          v-for="{ title, desc, pictures, id } in instructions"
          :key="id"
          class="intruction | mt-4"
        >
          <h5 class="accent--text mt-4 mb-2">
            <v-icon small>mdi-check</v-icon> {{ title }}
          </h5>
          <p
            v-for="(_desc, index) in desc.split('\n')"
            :key="index"
            class="mb-1"
          >
            {{ _desc }}
          </p>
          <div v-if="pictures?.length" class="pictures">
            <v-img
              v-for="(picture, i) in pictures"
              :key="i"
              :src="picture.url"
              aspect-ratio="4/3"
              class="ma-2"
            ></v-img>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'GeneralInfoPanel',
  props: {
    order: { type: Object, required: true },
  },
  computed: {
    ...mapState('oos/order', {
      instructions: (state) => state.instructions,
    }),
  },
}
</script>

<style lang="scss" scoped>
.info-col {
  column-gap: 0.5rem;
}
.instructions {
  font-size: 0.85rem;
}
.order-general-info {
  background-color: var(--clr-bg-alt);
}
.img-container {
  aspect-ratio: 4/3;
  border: 1px solid #444;
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
  }
}
.no-image-icon {
  opacity: 0.5;
}
</style>
