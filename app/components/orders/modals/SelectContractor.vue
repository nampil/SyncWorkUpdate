<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('selectContractor') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="contractors"
                :items="contractorsListFormatted"
                :label="$t('contractor')"
                dense
                outlined
                :multiple="multiple"
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-2 mb-2"
          outlined
          small
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
  name: 'SelectContractor',
  props: {
    show: { type: Boolean, default: false },
    multiple: { type: Boolean, default: true },
    contractorsOrderUids: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dialog: false,
      loading: false,
      contractorsList: [],
      contractors: [],
    }
  },
  computed: {
    contractorsListFormatted() {
      const array = this.contractorsList.filter(
        (c) => c && !this.contractorsOrderUids.includes(c.uid)
      )
      const _contractorsList = array.map((c) => ({
        value: c,
        text: c.fullName,
      }))
      return _contractorsList
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
      this.contractorsList = await this.$store.dispatch('get_contractors')
      this.loading = false
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },
  methods: {
    handleSave() {
      this.$emit('save', this.contractors)
      this.contractors = []
    },
  },
}
</script>

<style lang="scss" scoped></style>
