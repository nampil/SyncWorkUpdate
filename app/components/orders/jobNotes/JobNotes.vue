<template>
  <v-container>
    <div class="job-notes">
      <div class="job-note-content">
        <!-- Job Notes Pin-->
        <div v-if="jobNotesFormattedConPin.length" class="job-notes-pin">
          <h4 class="ml-1 mb-2 info--text">Pin</h4>
          <v-spacer></v-spacer>
          <div class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesFormattedConPin"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
        </div>
        <v-divider
          v-if="jobNotesFormattedConPin.length"
          class="mb-2"
        ></v-divider>

        <!-- Title de los Job Notes -->
        <div class="d-flex">
          <h4 class="ml-1 mb-3 info--text">
            {{ typeFilter ? typeFilter : 'All' }}
          </h4>
          <div v-if="dataFilter.length === 2" class="ml-5 mb-3 info--text">
            {{ dataFilter[0] + ' ~ ' + dataFilter[1] }}
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="error"
                  size="20"
                  v-bind="attrs"
                  v-on="on"
                  @click="$emit('clearFilterData')"
                >
                  mdi-calendar-remove-outline</v-icon
                >
              </template>
              <span>Remove Date Filter</span>
            </v-tooltip>
          </div>
        </div>

        <!-- Job Notes Work Order -->
        <div v-if="typeFilter === 'Work Order'" class="job-notes-work-order">
          <div v-if="jobNotesWorkOrder.length" class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesWorkOrder"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span v-else class="info-jobNote info--text d-flex justify-center"
            >Does not have job notes Work Order!</span
          >
        </div>

        <!-- Job Notes Property -->
        <div v-if="typeFilter === 'Property'" class="job-notes-property">
          <div v-if="jobNotesProperty.length" class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesProperty"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span v-else class="info-jobNote info--text d-flex justify-center"
            >Does not have job notes Property!</span
          >
        </div>

        <!-- All Job Notes -->
        <div
          v-if="typeFilter === 'All' || typeFilter === ''"
          class="all-job-notes"
        >
          <div v-if="jobNotesFormattedNoPin.length" class="job-notes-list">
            <!--  -->

            <job-note
              v-for="jobNote in jobNotesFormattedNoPin"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span
            v-else-if="
              !jobNotesFormattedNoPin.length || !jobNotesFormattedConPin.length
            "
            class="info-jobNote info--text d-flex justify-center"
          >
            Does not have job notes!
          </span>
        </div>

        <!-- Order Work Order Then Property-->
        <div v-if="typeFilter === 'Work Order Then Property'">
          <h4 class="ml-1 mb-2 info--text">Work Order</h4>
          <div v-if="jobNotesWorkOrder.length" class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesWorkOrder"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span v-else class="info-jobNote info--text d-flex justify-center"
            >Does not have job notes Work Order!</span
          >
        </div>
        <div v-if="typeFilter === 'Work Order Then Property'">
          <h4 class="ml-1 mb-2 info--text">Property</h4>
          <div v-if="jobNotesProperty.length" class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesProperty"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span v-else class="info-jobNote info--text d-flex justify-center"
            >Does not have job notes Property!</span
          >
        </div>

        <!-- Property Then Work Order -->
        <div v-if="typeFilter === 'Property Then Work Order'">
          <h4 class="ml-1 mb-2 info--text">Property</h4>
          <div v-if="jobNotesProperty.length" class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesProperty"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span v-else class="info-jobNote info--text d-flex justify-center"
            >Does not have job notes Property!</span
          >
        </div>
        <div v-if="typeFilter === 'Property Then Work Order'">
          <h4 class="ml-1 mb-2 info--text">Work Order</h4>
          <div v-if="jobNotesWorkOrder.length" class="job-notes-list">
            <job-note
              v-for="jobNote in jobNotesWorkOrder"
              :key="jobNote.id"
              :job-note="jobNote"
              :order="order"
            >
            </job-note>
          </div>
          <span v-else class="info-jobNote info--text d-flex justify-center"
            >Does not have job notes Work Order!</span
          >
        </div>
        <v-overlay :value="loading">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </div>
    </div>
  </v-container>
</template>
<script>
import JobNote from '@/components/orders/jobNotes/JobNote'

export default {
  name: 'JobNotes',
  components: { JobNote },
  props: {
    order: {
      type: Object,
      default: () => ({}),
    },
    typeFilter: {
      type: String,
      default: '',
    },
    search: {
      type: String,
      default: '',
    },
    dataFilter: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      showAddJobNote: false,
    }
  },
  computed: {
    goToJobNote() {
      return this.$store.state.order.goToJobNote
    },
    jobNotes() {
      const filterKey = this.search && this.search.toLowerCase()
      let _jobNotes = this.$store.state.order.jobNotes

      if (filterKey) {
        _jobNotes = _jobNotes.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().includes(filterKey)
          })
        })
      }
      return _jobNotes
    },
    jobNotesWorkOrder() {
      return this.jobNotesFormattedNoPin.filter(
        (j) => j.noteType === 'Work Order Notes'
      )
    },
    jobNotesProperty() {
      return this.jobNotesFormattedNoPin.filter(
        (j) => j.noteType === 'Property Notes'
      )
    },
    jobNotesFormatted() {
      const jobNotesNoPin = this.jobNotes.filter((j) => !j.pin)
      const jobNotesConPin = this.jobNotes.filter((j) => j.pin)
      return jobNotesConPin.concat(jobNotesNoPin)
    },
    jobNotesFormattedNoPin() {
      /* return this.jobNotes.filter((j) => !j.pin) */
      if (this.dataFilter.length === 2) {
        let _jobNotes = this.jobNotes.filter((j) => !j.pin)
        if (!_jobNotes.length) {
          return []
        }
        _jobNotes = _jobNotes.filter((e) => {
          let thisDate = e.updatedAt.toDate()
          thisDate = new Date(
            thisDate.getFullYear(),
            thisDate.getMonth(),
            thisDate.getDate()
          )
          const ini = new Date(this.dataFilter[0])
          const fin = new Date(this.dataFilter[1])

          if (thisDate >= ini && thisDate <= fin) {
            return true
          } else if (thisDate <= ini && thisDate >= fin) {
            return true
          } else {
            return false
          }
        })
        return _jobNotes
      } else {
        return this.jobNotes.filter((j) => !j.pin)
      }
    },
    jobNotesFormattedConPin() {
      return this.jobNotes.filter((j) => j.pin)
    },
  },
  watch: {
    $route(newVal) {
      if (newVal.query && newVal.query.jnid) {
        this.handleGoToJobNote()
      }
    },

    order(newVal, oldVal) {
      if (newVal.id !== oldVal.id) {
        this.getJobNotes()
      }
    },
  },

  mounted() {
    this.getJobNotes()
  },
  beforeDestroy() {
    // this.$store.commit('order/flush_jobNotesState')
  },
  methods: {
    handleGoToJobNote() {
      if (!this.goToJobNote) {
        return
      }
      const jobNoteDiv = this.$el.querySelector(`#${this.goToJobNote}`)

      if (!jobNoteDiv) {
        return
      }

      this.$el.scrollTo({
        top: jobNoteDiv.offsetTop - 100,
        behavior: 'smooth',
      })
      this.$store.commit('order/set_goToJobNote', '')
      jobNoteDiv.classList.add('highlight')
      setTimeout(() => {
        jobNoteDiv.classList.remove('highlight')
      }, 5000)
    },
    async getJobNotes() {
      this.loading = true
      try {
        // Get jobNotes for order ---- Buscar los notas de Trabajo de la orden especifica.
        const orderId = this.order.id
        const propertyId = this.order.propertyId

        await this.$store.dispatch('order/get_jobNotes_for_order', {
          orderId,
          propertyId,
        })

        this.loading = false
        this.$nextTick(() => {
          this.handleGoToJobNote()
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
  },
}
</script>
<styles lang="scss" scoped>
.info-jobNote {
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: -0.5rem;
}
</styles>
