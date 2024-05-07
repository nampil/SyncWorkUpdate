<template>
  <v-card
    class="container-add-materials | d-flex flex-column overflow-hidden elevation-0"
  >
    <v-toolbar color="secondary" dense class="flex-grow-0">
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="d-flex aling-center">
        <!-- <v-icon color="white" class="mr-4">mdi-text-box-plus-outline</v-icon> -->
        {{ $t('addMaterialsOrTools') }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          ref="botonSave"
          text
          :loading="loading"
          @click.stop="handleSave()"
          >{{ $t('save') }}</v-btn
        >
      </v-toolbar-items>
    </v-toolbar>
    <div class="flex-grow-1 overflow-y-auto">
      <v-card-text class="text-center">
        <v-form ref="formMaterials" class="mt-5 mb-5" lazy-validation>
          <v-row>
            <v-col class="d-flex" cols=" 12">
              <v-combobox
                v-model="materialsOrTools"
                :items="materialsOrToolsBd"
                item-text="title"
                item-value="title"
                :label="$t('title')"
                dense
                outlined
                multiple
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
                        No results matching what was "<strong>added</strong>",
                        Press
                        <kbd>enter</kbd> to create a new one.
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-combobox>
            </v-col>
          </v-row>
        </v-form>
        <!-- <div class="task-action text-center pt-0">
          <v-btn icon :disabled="validateData" @click="addMaterials()"
            ><v-icon>mdi-plus-circle-outline</v-icon></v-btn
          >
        </div> -->
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
          ref="botonSave"
          class="mr-3"
          color="secondary"
          :loading="loading"
          :disabled="localNeedToSave"
          @click.stop="handleSave()"
          >{{ $t('save') }}</v-btn
        >
      </v-card-actions> -->
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'AddMaterialsOrTools',
  props: {
    materialsOrToolsBd: { type: Array, default: () => [] },
  },
  data() {
    return {
      rulesTitle: [(v) => (!!v && v.length !== 0) || this.$t('titleRequired')],
      loading: false,
      materialsOrTools: [],
    }
  },
  computed: {
    localNeedToSave() {
      if (!this.materialsOrTools.length || this.materialsOrTools.length === 0) {
        return true
      }
      return false
    },
  },
  watch: {
    localNeedToSave(val) {
      this.$emit('update-persistent', !val)
    },
  },

  methods: {
    close() {
      this.$refs.formMaterials.resetValidation()
      this.materialsOrTools = []
      this.$emit('close')
    },
    handleSave() {
      if (!this.$refs.formMaterials.validate()) {
        return
      }
      this.$emit('new-materials-or-tools', this.materialsOrTools)
      this.$emit('close')
    },
    delete_items(index) {
      this.materialsOrTools.splice(index, 1)
    },
    handleTaskTitle(items) {
      if (!items || !items.length) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const { desc, ..._item } = item
        this.materialsOrTools[i] = _item
        if (this.materialsOrTools[i] && isNaN(this.materialsOrTools[i].id)) {
          this.materialsOrTools[i].id =
            '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
        }
        if (typeof item !== 'object') {
          this.materialsOrTools[i] = {
            title: item,
            id:
              '' +
              new Date().getTime() +
              Math.floor(1000 + Math.random() * 9000),
          }
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
