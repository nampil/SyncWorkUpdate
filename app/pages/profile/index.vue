<template>
  <v-container class="profile mt-10">
    <EditProfile />
    <UpdatePassword />
    <LanguagePreference />

    <v-overlay :value="loadingOverlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import EditProfile from '@/components/admin/profile/EditProfile.vue'
import UpdatePassword from '@/components/admin/profile/UpdatePassword.vue'
import LanguagePreference from '@/components/admin/profile/LanguagePreference.vue'

export default {
  name: 'Profile',
  components: { EditProfile, UpdatePassword, LanguagePreference },

  layout: 'dash',

  data() {
    return {
      loadingOverlay: false,
    }
  },
  head() {
    return {
      title: 'Profile',
    }
  },
}
</script>

<style lang="scss" scoped></style>
