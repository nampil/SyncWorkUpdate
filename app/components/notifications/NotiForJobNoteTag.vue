<template>
  <div class="noti-container">
    <div class="noti-header | d-flex justify-space-between align-center">
      <h5 class="text-h6">{{ noti.title }}</h5>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            color="error"
            v-bind="attrs"
            v-on="on"
            @click="$emit('delete')"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span> {{ $t('deleteNotification') }}</span>
      </v-tooltip>
    </div>
    <div class="noti-body mb-2">
      <p class="ma-0 mb-2">
        {{ noti.body }}
      </p>
      <v-btn
        color="secondary"
        class="elevation-0"
        small
        @click="handleGoToJobNote(noti.link)"
        >{{ $t('goToJobNote') }}</v-btn
      >

      <div class="noti-meta">
        <p
          class="ma-0 grey--text text--darken-2 font-weight-light text-caption text-right"
        >
          {{ noti.createdAt }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotiForJobNoteTag',

  props: {
    noti: { type: Object, default: () => ({}) },
  },
  data() {
    return {}
  },
  methods: {
    handleGoToJobNote(link) {
      this.$emit('close')
      this.$nextTick(() => {
        this.$router.replace(link).catch((error) => {
          if (error.name !== 'NavigationDuplicated') {
            throw error
          }
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.info-to-delete {
  .img-container {
    width: 150px;
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
      cursor: pointer;
    }
  }
}
// .authorized {
// }
</style>
