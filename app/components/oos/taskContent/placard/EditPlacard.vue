<template>
  <div>
    <v-card>
      <v-toolbar dense color="secondary">
        <v-btn icon :disabled="loading" @click.stop="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Edit Placard</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            ref="botonSave"
            text
            class="white--text"
            :loading="loading"
            @click.stop="handleSave()"
            >{{ $t('save') }}</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-form ref="formPlacard" class="placard-form" lazy-validation>
          <v-text-field
            v-model="newPlacardText"
            label="Placard"
            hide-details="auto"
            outlined
            dense
            :rules="rulesPlacard"
          ></v-text-field>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'EditPlacard',
  props: {
    report: { type: Object, default: () => {} },
    fromOos: { type: Boolean, default: false },
    fromBids: { type: Boolean, default: false },
    reports: { type: Array, default: () => [] },
  },
  data() {
    return {
      newPlacardText: '',
      loading: false,
      rulesPlacard: [(v) => !!v || this.$t('thisFieldRequired')],
    }
  },
  computed: {
    localNeedToSave() {
      return this.report?.placard?.text !== this.newPlacardText
    },
  },
  mounted() {
    this.newPlacardText = this.report?.placard?.text || ''
  },

  methods: {
    close() {
      this.$emit('close')
    },
    async handleSave() {
      if (!this.$refs.formPlacard.validate()) {
        return
      }
      if (!this.localNeedToSave) {
        this.$mainAlertInfo('You have no changes to save')
        return
      }

      try {
        this.loading = true

        if (this.reports.length === 0) {
          const { orderId, task, id: reportId } = this.report
          const objectToSend = {
            ...this.report,
            placard: {
              ...this.report.placard,
              text: this.newPlacardText,
            },
          }
          await this.$store.dispatch('order/update_report', {
            reportId,
            orderId,
            taskType: task.type,
            taskId: task.id,
            hasToCommitUpdate: this.fromOos,
            objectToSend,
          })

          if (!this.fromOos || this.fromBids) {
            this.$emit('update-report', objectToSend)
          }
        } else {
          const _reports = []
          this.reports.forEach((report) => {
            let placard = {}
            if (report.placard) {
              placard = {
                ...report.placard,
                text: this.newPlacardText,
              }
            } else if (this.reports.filter((r) => r.placard).length) {
              const _reports = this.reports.filter((r) => r.placard)
              placard = {
                ..._reports[0].placard,
                text: this.newPlacardText,
              }
            } else {
              placard = {
                text: this.newPlacardText,
                backgroundColor: '#000',
                boxSize: {},
                fontSize: 18,
                position: {
                  x: 0.0399999910593033,
                  y: 0.0399999910593033,
                },
              }
            }

            const object = {
              ...report,
              placard,
            }
            _reports.push({ ...object })
          })

          await this.$store.dispatch('order/update_reports', {
            reports: _reports,
          })

          if (!this.fromOos) {
            this.$emit('update-reports', _reports)
          }
        }

        this.close()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error saving placard text', error)
        this.$mainAlertError(
          'There was an error saving placard text, please try later. If error persists, contact support'
        )
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
