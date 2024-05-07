<template>
  <div class="container-materials-view">
    <div v-for="(material, i) in materialsOrTools" :key="i" class="pb-2">
      <v-icon size="14" color="grey">mdi-brightness-1 </v-icon>
      <span>{{ material.title }}</span>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="ml-1"
            icon
            color="primary"
            x-small
            v-bind="attrs"
            v-on="on"
            @click="handlerEditMaterialOrTool(material)"
          >
            <v-icon size="17">mdi-text-box-edit-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('editMaterialOrTool') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-2"
            icon
            x-small
            v-bind="attrs"
            v-on="on"
            @click="handlerDeleteMaterialOrTool(material)"
          >
            <v-icon color="error" size="17">mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('deleteMaterialOrTool') }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialsOrToolsView',
  props: {
    materialsOrTools: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {}
  },
  methods: {
    handlerDeleteMaterialOrTool(material) {
      this.$emit('delete-material-or-tool', material)
    },
    handlerEditMaterialOrTool(material) {
      this.$emit('edit-material-or-tool', material)
    },
  },
}
</script>

<style lang="scss" scoped></style>
