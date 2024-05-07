<template>
  <v-card class="container-edit-material">
    <v-toolbar color="secondary" dense>
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="d-flex aling-center">
        <!-- <v-icon color="white" class="mr-4">mdi-text-box-edit-outline</v-icon> -->
        {{ $t('editMaterialOrTool') }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          text
          :loading="loading"
          :disabled="localNeedToSave"
          @click.stop="updateMaterialOrTool()"
          >{{ $t('update') }}</v-btn
        >
      </v-toolbar-items>
    </v-toolbar>

    <v-card-text>
      <v-form ref="formMaterials" class="mt-5" lazy-validation>
        <v-row>
          <v-col class="d-flex" cols=" 12">
            <v-combobox
              v-model="editMaterial"
              :items="materialsOrToolsBd"
              item-text="title"
              :label="$t('title')"
              dense
              outlined
              clearable
              :rules="rulesTitle"
              autofocus
              hide-details="auto"
              @input="handleTaskTitle($event)"
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ $t('No results matching what was') }}
                      "<strong>{{ $t('added') }}</strong
                      >",
                      {{ $t('Press') }}
                      <kbd>{{ $t('enter') }}</kbd>
                      {{ $t('to create a new one') }}.
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </v-col>
        </v-row>
      </v-form>
      <!-- <v-divider class="mt-6"></v-divider> -->
    </v-card-text>

    <!-- <v-card-actions class="btn-actions | d-flex justify-end pb-6">
      <v-btn
        class="mr-4"
        color="error"
        outlined
        :disabled="loading"
        @click.stop="close()"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn
        class="mr-3"
        color="secondary"
        :loading="loading"
        :disabled="localNeedToSave"
        @click.stop="updateMaterialOrTool()"
        >{{ $t('update') }}</v-btn
      >
    </v-card-actions> -->
  </v-card>
</template>

<script>
export default {
  name: 'EditMaterialOrTool',
  props: {
    materialsOrToolsBd: { type: Array, default: () => [] },
    editedMaterialOrTool: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      rulesTitle: [(v) => (!!v && v.length !== 0) || this.$t('titleRequired')],
      editMaterial: '',
      loading: false,
      editId: '',
    }
  },
  computed: {
    localNeedToSave() {
      if (
        this.editMaterial &&
        this.editedMaterialOrTool &&
        this._.isEqual(this.editMaterial.title, this.editedMaterialOrTool.title)
      ) {
        return true
      }
      return false
    },
  },
  watch: {
    editedMaterialOrTool() {
      this.editMaterial = this.editedMaterialOrTool
      this.editId = this.editedMaterialOrTool.id
    },
    localNeedToSave(val) {
      this.$emit('update-persistent', !val)
    },
  },
  mounted() {
    this.editMaterial = this.editedMaterialOrTool
    this.editId = this.editedMaterialOrTool.id
  },

  methods: {
    handleTaskTitle(item) {
      if (!item) return

      const { desc, ..._item } = item
      this.editMaterial = _item

      if (this.editMaterial && isNaN(this.editMaterial.id)) {
        this.editMaterial.id = this.editId
      }
      if (typeof item !== 'object') {
        this.editMaterial = {
          title: item,
          id: this.editId,
        }
      }
    },
    updateMaterialOrTool() {
      if (!this.$refs.formMaterials.validate()) {
        return
      }

      this.$emit('update-material-or-tool', {
        editId: this.editId,
        editMaterial: this.editMaterial,
      })
      this.close()
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped></style>
