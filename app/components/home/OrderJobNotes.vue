<template>
  <div class="order-job-notes | pa-4">
    <div class="job-note-list">
      <div v-if="loading">Loading...</div>
      <div v-else-if="jobNotes.length">
        <header>
          <h4 class="info--text mb-2">Work Order Notes</h4>
        </header>
        <JobNote
          v-for="note in workOrderNotes"
          :key="note.id"
          :job-note="note"
          :order="{ id: orderId }"
          :from-search="true"
        ></JobNote>
        <v-divider class="mb-4"></v-divider>
        <header>
          <h4 class="info--text">Property Notes</h4>
        </header>
        <JobNote
          v-for="note in propertyNotes"
          :key="note.id"
          :job-note="note"
          :order="{ id: orderId }"
          :from-search="true"
        ></JobNote>
      </div>
      <div v-else>No notes</div>
    </div>
  </div>
</template>

<script>
import JobNote from '../orders/jobNotes/JobNote.vue'
import { JOB_NOTES_TYPES } from '~/utils/dictionaries'
export default {
  name: 'OrderJobNotes',
  components: {
    JobNote,
  },
  props: {
    orderId: {
      type: String,
      required: true,
    },
    propertyId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      jobNotes: [],
      loading: false,
    }
  },
  computed: {
    workOrderNotes() {
      if (!this.jobNotes.length) return []
      return this.jobNotes.filter(
        (note) => note.noteType === JOB_NOTES_TYPES.workOrderNotes
      )
    },
    propertyNotes() {
      if (!this.jobNotes.length) return []
      return this.jobNotes.filter(
        (note) => note.noteType === JOB_NOTES_TYPES.propertyNotes
      )
    },
  },
  created() {
    this.getJobNotes()
  },
  methods: {
    async getJobNotes() {
      try {
        this.loading = true
        const jobNotes = await this.$store.dispatch('search/get_jobNotes', {
          orderId: this.orderId,
          propertyId: this.propertyId,
        })
        this.jobNotes = jobNotes
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading Job Notes', error)
        this.$mainAlertError('Error loading Job Notes')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.order-job-notes {
  width: 400px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  background-color: var(--clr-bg-alt);
}
</style>
