<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Select Processor</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="processor"
                :items="processorsListFormatted"
                label="Processor"
                dense
                outlined
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-2 mb-2"
          small
          outlined
          color="error"
          @click="$emit('close')"
        >
          {{ $t('close') }}
        </v-btn>
        <v-btn class="mb-2 mr-2" small color="secondary" @click="handleSave"
          >{{ $t('assign') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SelectProcessor',
  props: {
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      dialog: false,
      loading: false,
      processorsList: [],
      processor: {},
    }
  },
  computed: {
    processorsListFormatted() {
      const _list = this.processorsList.map((c) => ({
        value: c,
        text: c.fullName,
      }))
      return _list
    },
  },
  watch: {
    show(val) {
      this.dialog = val
    },
  },
  async mounted() {
    try {
      this.loading = true
      this.processorsList = await this.$store.dispatch('get_processors')
      this.loading = false
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },
  methods: {
    handleSave() {
      this.$emit('save', this.processor)
      this.processor = {}
    },
  },
}
</script>

<style lang="scss" scoped></style>
