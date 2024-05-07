<template>
  <div class="container-group-name">
    <v-card class="elevation-0">
      <v-toolbar color="secondary" dense>
        <v-toolbar-title class="d-flex aling-center">
          <v-icon color="white" class="mr-4">mdi-text-box-edit-outline</v-icon>
          <span class="ma-0 text-h5 white--text">{{
            $t('editGroupName')
          }}</span></v-toolbar-title
        >
      </v-toolbar>
      <v-card-text class="text-center">
        <v-form ref="formEditGroupName" class="task-form mt-5" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="newGroupName"
                :label="$t('groupName')"
                outlined
                autofocus
                dense
                hide-details="auto"
                auto-grow
                maxlength="240"
                rows="1"
              >
              </v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="btn-actions | d-flex justify-end pb-6">
        <v-btn
          class="mr-4"
          color="error"
          outlined
          :disabled="loading"
          @click="close()"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn
          ref="botonUpdate"
          class="mr-3"
          color="secondary"
          :loading="loading"
          :disabled="
            !newGroupName || !newGroupName.trim() || newGroupName === groupName
          "
          @click="updateGroupName()"
          >{{ $t('update') }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'GroupNameComp',
  props: {
    route: { type: Object, default: () => ({}) },
    groupName: { type: String, default: '' },
  },
  data() {
    return { loading: false, newGroupName: '' }
  },
  watch: {
    groupName() {
      this.newGroupName = this.groupName
    },
  },
  mounted() {
    this.newGroupName = this.groupName
  },
  methods: {
    close() {
      this.showEditgroupName = false
      this.newGroupName = this.groupName

      this.$emit('close')
    },
    updateGroupName() {
      this.$emit('update-group-name', this.newGroupName)
      this.close()
    },
  },
}
</script>

<style lang="scss" scoped></style>
