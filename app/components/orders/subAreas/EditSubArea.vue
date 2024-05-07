<template>
  <div class="edit-sub-area">
    <v-card class="elevation-0">
      <v-toolbar color="secondary" dense>
        <v-btn icon :disabled="loading" @click.stop="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="d-flex aling-center">
          <!-- <v-icon color="white" class="mr-4">mdi-text-box-edit-outline</v-icon> -->
          {{ $t('editSubArea') }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            ref="botonUpdate"
            text
            :loading="loading"
            :disabled="localNeedToSave"
            @click="updateSubArea()"
            >{{ $t('update') }}</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="fromSubAreas" class="mt-5 mb-5" lazy-validation>
          <v-row>
            <v-col cols=" 12">
              <v-combobox
                v-model="editTitle"
                :items="subAreasFormatted"
                item-text="title"
                item-value="title"
                :label="$t('title')"
                outlined
                clearable
                hide-details="auto"
                dense
                :rules="rules"
                @input="handleSubArea($event)"
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
                </template></v-combobox
              >
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'EditSubArea',
  props: {
    editedArea: { type: Object, default: () => ({}) },
    subAreas: { type: Array, default: () => [] },
    subAreasInTask: { type: Array, default: () => [] },
  },

  data() {
    return {
      rules: [(v) => !!v || this.$t('thisFieldRequired')],
      loading: false,
      editTitle: '',
      editId: '',
    }
  },
  computed: {
    subAreasFormatted() {
      if (this.subAreas.length && this.subAreasInTask.length) {
        return this.subAreas.filter(
          (e) => !this.subAreasInTask.map((a) => a.title).includes(e.title)
        )
      } else {
        return this.subAreas
      }
    },
    localNeedToSave() {
      if (this.editTitle === this.editedArea.title) {
        return true
      }
      return false
    },
  },
  watch: {
    editedArea() {
      this.editTitle = this.editedArea.title
      this.editId = this.editedArea.id
    },

    localNeedToSave(val) {
      this.$emit('update-persistent', !val)
    },
  },

  mounted() {
    this.editTitle = this.editedArea.title
    this.editId = this.editedArea.id
  },

  methods: {
    updateSubArea() {
      if (!this.$refs.fromSubAreas.validate()) {
        return
      }

      this.$emit('update-sub-area', {
        title: this.editTitle,
        id: this.editId,
      })
      this.close()
    },

    close() {
      this.$emit('close')
    },
    handleSubArea(subArea) {
      if (!subArea) {
        return
      }

      if (typeof subArea !== 'object') {
        this.editTitle = subArea.trim().replace('/', '-')
        return
      }
      this.editTitle = subArea.title.trim().replace('/', '-')
    },
  },
}
</script>
<style lang="scss" scoped></style>
