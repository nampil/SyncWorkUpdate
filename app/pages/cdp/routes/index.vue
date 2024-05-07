<template>
  <div class="container-edit-routes">
    <v-toolbar color="secondary" dark class="elevation-0" dense>
      <v-toolbar-title class="subtitle-2">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-2"
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click.stop="$router.go(-1)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('back') }}</span>
        </v-tooltip>

        <span class="accent--text subtitle-2">{{ $t('quickRouting') }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
    </v-toolbar>
    <RoutingContentEdit></RoutingContentEdit>
  </div>
</template>

<script>
import RoutingContentEdit from '~/components/oos/editRoutesContent/RoutingContentEdit.vue'

export default {
  name: 'IndexRoutes',
  components: { RoutingContentEdit },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped></style>
