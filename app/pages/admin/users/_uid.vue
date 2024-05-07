<template>
  <v-container fluid class="pa-0">
    <v-toolbar color="secondary" dense>
      <v-toolbar-title>{{ $t('userManagement') }}</v-toolbar-title>
    </v-toolbar>

    <div v-if="userData" class="content | pa-4">
      <div class="header | mb-8">
        <h2 class="user-name | ma-0">
          {{ userData ? userData.profile.fullName : '' }}
        </h2>
      </div>
      <v-row>
        <v-col cols="6">
          <div class="header | d-flex justify-space-between align-center my-4">
            <h3 class="ma-0 text-h6">Ratings</h3>
            <p class="d-flex align-center gap-4 text-h6 ma-0">
              <v-icon color="accent lighten-2">mdi-star</v-icon> {{ avgRating }}
            </p>
          </div>

          <div>
            <Ratings :user-id="$route.params.uid" />
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import Ratings from '~/components/admin/users/Ratings.vue'

export default {
  name: 'UserManagement',
  components: { Ratings },
  layout: 'dash',
  data() {
    return {
      userData: null,
    }
  },
  async fetch() {
    try {
      const getUserData = this.$store.dispatch('admin/users/get_userById', {
        userId: this.$route.params.uid,
      })
      const [_userData] = await Promise.all([getUserData])
      this.userData = _userData
    } catch (error) {
      // eslint-disable-next-line
      console.log('error', error)
    }
  },
  computed: {
    avgRating() {
      if (!this.userData || !this.userData.ratingsStats) return 0
      const { performance, quality, time } = this.userData.ratingsStats
      return ((performance + quality + time) / 3).toFixed(2)
    },
  },
}
</script>

<style lang="scss" scoped></style>
