<template>
  <v-dialog
    v-model="showModal"
    :overlay="false"
    max-width="700px"
    scrollable
    :persistent="loading"
    transition="dialog-transition"
  >
    <v-card>
      <v-toolbar color="primary" dense>
        <v-toolbar-title>{{ $t('Ask for reapply reports') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon :disabled="loading" @click="$emit('cancel')"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-toolbar>
      <v-card-text>
        <v-form ref="reapplyForm" class="pt-4">
          <h4>{{ $t('Reports for reapply') }}:</h4>
          <div class="reports-container | py-4">
            <div class="inner-reports-container">
              <div
                v-for="(report, i) in reports"
                :key="i"
                class="img-container"
              >
                <img v-if="report && report.url" :src="report.url" alt="" />
                <div v-else class="loading-preview">
                  <v-icon color="error">mdi-image-sync-outline</v-icon>
                </div>
              </div>
            </div>
          </div>
          <v-textarea
            v-model="requirementsDesc"
            outlined
            auto-grow
            hide-details="auto"
            rows="1"
            dense
            label="Requirement description"
            :rules="[(v) => !!v || 'This field is required']"
          >
          </v-textarea>
          <v-checkbox
            v-model="hasToDeleteReports"
            label="Delete reports?"
          ></v-checkbox>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end gap-8">
        <v-btn
          color="error"
          outlined
          :disabled="loading"
          @click="$emit('cancel')"
          >{{ $t('cancel') }}</v-btn
        >
        <v-btn color="primary" :loading="loading" @click="handleSend">{{
          $t('send')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ReapplyReportsForm',
  props: {
    reports: { type: Array, default: () => [] },
    requirement: { type: Object, default: () => ({}) },
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      showModal: false,
      requirementsDesc: '',
      hasToDeleteReports: false,
      newRequirement: {
        descRequirement: '',
        contractorCompleted: false,
        oosChecked: false,
        quantityPhotosRequired: null,
        files: [],
        pictures: [],
        fromBefore: false,
        fromDuring: false,
        fromAfter: false,
        fromGeneral: false,
        fromInspection: false,
        placard: true,
        placardText: '',
        position: 0,
      },
    }
  },
  watch: {
    show(val) {
      if (val !== this.showModal) {
        this.showModal = val
      }
    },
    showModal(val) {
      if (!val && this.show) {
        this.handleCancel()
      }
    },
  },

  methods: {
    handleCancel() {
      this.requirementsDesc = ''
      this.hasToDeleteReports = false
      this.$refs.reapplyForm.resetValidation()

      this.$emit('cancel')
    },

    async handleSend() {
      if (!this.$refs.reapplyForm.validate()) return

      try {
        this.loading = true

        const orderId = this.reports[0].orderId
        const type = this.reports[0].task.type
        const taskId = this.reports[0].task.id
        const { id, startedAt, startedBy, finishedAt, ...newRequirement } =
          this.requirement

        const usersToNotify = []

        if (typeof startedBy === 'string') {
          usersToNotify.push(startedBy)
        } else {
          usersToNotify.push(startedBy.uid)
        }

        const files = []
        const promises = []

        for (let index = 0; index < this.reports.length; index++) {
          const report = this.reports[index]
          const url = report.url
          const res = await fetch(url)
          const file = await res.blob()
          file.name = report.codeName
          files.push(file)

          if (!this.hasToDeleteReports) {
            const markedReportForReapply = this.$store.dispatch(
              'oos/orders/update_reportSetForReapply',
              { report }
            )
            promises.push(markedReportForReapply)
          }
        }
        const _position = this.requirement.position + 1
        const requirementAdded = this.$store.dispatch(
          'oos/orders/add_requirements',
          {
            orderId,
            type,
            taskId,
            requirements: [
              {
                ...newRequirement,
                descRequirement: this.requirementsDesc,
                started: false,
                position: _position,
                files,
                isReapply: true,
                contractorCompleted: false,
                contractorCompletedAt: null,
                oosChecked: false,
                finished: false,
                finishedBy: null,
              },
            ],
            usersToNotify,
          }
        )

        promises.push(requirementAdded)

        if (this.hasToDeleteReports) {
          this.$emit('delete-reports', this.reports)
        }

        const results = await Promise.allSettled(promises)

        results.forEach((result) => {
          // eslint-disable-next-line
          console.log('result', result)
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError('Error creating new requirement for reapply')
      } finally {
        this.loading = false
        this.handleCancel()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.reports-container {
  position: relative;
}

.inner-reports-container {
  overflow-x: auto;
  display: flex;
  gap: 1rem;
  padding-block: 1rem;
}
.img-container {
  width: 100px;
  height: 100px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .loading-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 4px;
    border: 1px solid var(--clr-neutral-200);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
