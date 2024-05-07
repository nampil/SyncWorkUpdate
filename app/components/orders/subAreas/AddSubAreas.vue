<template>
  <v-card
    class="container-add-sub-areas | d-flex flex-column overflow-hidden elevation-0"
  >
    <v-toolbar color="secondary" dense class="flex-grow-0">
      <v-btn icon :disabled="loading" @click.stop="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="d-flex aling-center">
        <!-- <v-icon color="white" class="mr-4">mdi-text-box-plus-outline</v-icon> -->
        {{ $t('addSubAreas') }}</v-toolbar-title
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
        <v-form ref="fromSubAreas" class="mt-5" lazy-validation>
          <v-row class="mb-6">
            <v-col cols="12">
              <v-combobox
                v-model="localSubAreas"
                :items="subAreasFormatted"
                item-text="title"
                item-value="title"
                :label="$t('subAreas')"
                outlined
                multiple
                clearable
                hide-details="auto"
                dense
                :rules="rulesSubAreas"
                @input="handleSubAreas($event)"
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
        <!-- <v-divider></v-divider> -->
      </v-card-text>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'AddSubAreas',
  props: {
    subAreas: { type: Array, default: () => [] },
    areas: { type: Array, default: () => [] },
    subAreasInTask: { type: Array, default: () => [] },
  },

  data() {
    return {
      rulesSubAreas: [
        (v) => (!!v && v.length !== 0) || this.$t('thisFieldRequired'),
      ],
      loading: false,
      localSubAreas: [],
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
      if (
        this.localSubAreas &&
        this.localSubAreas.length &&
        this.localSubAreas.filter((r) => r.title !== '' && r.title !== null)
          .length
      ) {
        return true
      } else {
        return false
      }
    },
  },
  watch: {
    localNeedToSave(val) {
      this.$emit('update-persistent', val)
    },
    inmediate: true,
  },

  methods: {
    handleSave() {
      if (!this.$refs.fromSubAreas.validate()) {
        return
      }
      const _newAreas = structuredClone(this.localSubAreas)
      this.localSubAreas = []
      this.$refs.fromSubAreas.resetValidation()
      this.$emit('new-sub-areas', _newAreas)
      this.$emit('close')
    },
    close() {
      this.$refs.fromSubAreas.reset()
      this.$nextTick(() => {
        this.localSubAreas = []
      })
      this.$emit('close')
    },

    handleSubAreas(subAreas) {
      if (!subAreas || !subAreas.length) {
        return
      }

      for (let i = 0; i < subAreas.length; i++) {
        const subArea = subAreas[i]
        const id =
          '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)

        if (typeof subArea !== 'object') {
          this.localSubAreas[i] = {
            title: subArea.trim().replace('/', '-'),
            id,
          }
          return
        }

        this.localSubAreas[i] = {
          title: subArea.title.trim().replace('/', '-'),
          id,
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
