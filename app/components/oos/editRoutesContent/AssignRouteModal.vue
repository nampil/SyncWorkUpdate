<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('assignContractor(s)') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="8">
              <v-autocomplete
                v-model="contractorsSelected"
                :items="contractorsListFiltered"
                :label="$t('contractors')"
                dense
                outlined
                multiple
                hide-selected
              ></v-autocomplete>
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" @click="addContractorToList">{{
                $t('addContractor')
              }}</v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div>
                <div class="grid mb-4">
                  <div class="header contractor-name">
                    <div class="text-h6">{{ $t('contractors') }}</div>
                  </div>
                  <div class="header">
                    <div class="text-h6 text-center">
                      {{ $t('lead') }}
                    </div>
                  </div>
                </div>
                <div
                  v-for="item in localContractors"
                  :key="item.uid"
                  class="grid grid-row"
                >
                  <div class="contractor-name">
                    {{ item.fullName }}
                  </div>

                  <div class="contractor-lead-btn">
                    <v-radio-group v-model="lead" dense hide-details>
                      <v-radio :value="item"></v-radio>
                    </v-radio-group>
                  </div>

                  <v-btn
                    small
                    icon
                    :disabled="!contractors.length || !lead.fullName"
                    class="contractor-closeBtn"
                    @click="handleRemoveContractor(item)"
                  >
                    <v-btn icon small>
                      <v-icon small color="red">mdi-close</v-icon>
                    </v-btn>
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="mr-2 mb-2" outlined color="error" @click="handleClose"
          >{{ $t('close') }}
        </v-btn>
        <v-btn
          class="mb-2 mr-2"
          color="secondary"
          :loading="loading"
          @click="handleSave"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AssignRouteModal',
  props: {
    show: { type: Boolean, default: false },
    orders: { type: Array, default: () => [] },
    contractors: { type: Array, default: () => [] },
    routeLead: { type: Object, default: () => ({}) },
    routeId: { type: String, default: '' },
  },
  data() {
    return {
      contractorsSelected: [],
      contractorsList: [],
      dialog: false,
      loading: false,

      localContractors: [],
      lead: {},
    }
  },
  computed: {
    contractorsListFiltered() {
      const _contractors = this.contractorsList.filter((c) => {
        return !this.localContractors.map((c) => c.fullName).includes(c.text)
      })

      return _contractors
    },
  },
  watch: {
    show(val) {
      if (val && !this.contractorsListFiltered.length) {
        this.setInitialState()
      }
      this.initializeData()
      this.dialog = val
    },
  },
  mounted() {
    this.setInitialState()
    this.initializeData()
  },
  methods: {
    initializeData() {
      this.localContractors = this.contractors

      if (this.routeLead && this.routeLead.uid) {
        this.lead = this.routeLead
      }
    },

    async setInitialState() {
      try {
        this.loading = true
        const _contractorList = await this.$store.dispatch('get_contractors')
        this.contractorsList = _contractorList.map((c) => ({
          value: c,
          text: c.fullName,
        }))
        this.loading = false
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },
    addContractorToList() {
      this.localContractors = [
        ...this.localContractors,
        ...this.contractorsSelected,
      ]

      this.contractorsSelected = []
    },
    handleSave() {
      this.loading = true

      this.$emit('update-contractors', {
        lead: this.lead,
        contractors: this.localContractors,
      })
      this.loading = false

      this.$emit('close')
    },
    handleRemoveContractor(contractor) {
      const _contractors = [...this.localContractors]
      const index = this.localContractors
        .map((c) => c.uid)
        .indexOf(contractor.uid)
      if (index === -1) return
      if (this.localContractors[index].uid === this.lead.uid) {
        this.lead = {}
      }
      _contractors.splice(index, 1)

      this.localContractors = _contractors
    },
    handleClose() {
      this.contractorsSelected = []

      this.lead = {}
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 60px 60px;
  grid-template-rows: 1fr;
  align-items: center;
  justify-items: center;
}
.grid-row {
  padding-block: 0.5rem;
}
.contractor-name {
  justify-self: start;
}
.grid::v-deep .v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}
</style>
