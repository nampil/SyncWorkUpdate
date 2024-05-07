<template>
  <v-card>
    <v-toolbar color="primary" dense>
      <v-icon class="mr-4" color="yellow accent-4">mdi-star</v-icon>
      <v-toolbar-title>
        <span class="ma-0 text-h7 white--text"
          >Rating {{ contractor.name }}'s performance</span
        >
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <p class="mt-4">Please Rate {{ contractor.name }}'s work'</p>

      <ul class="pa-0">
        <li class="mb-10">
          <p>
            1. How does {{ contractor.name }} manage their time doing this task?
          </p>
          <div class="d-flex align-center justify-space-between">
            <v-rating
              v-model="localRating.time"
              background-color="info"
              color="yellow accent-4"
              dense
              half-increments
              hover
              size="20"
              @input="handleRatingInput"
            ></v-rating>
            <p class="ma-0">{{ localRating.time }}</p>
          </div>
        </li>
        <li class="mb-10">
          <p>
            2. What is the quality of the {{ contractor.name }}'s reports for
            this task?
          </p>
          <div class="d-flex align-center justify-space-between">
            <v-rating
              v-model="localRating.quality"
              background-color="info"
              color="yellow accent-4"
              dense
              half-increments
              hover
              size="20"
              @input="handleRatingInput"
            ></v-rating>
            <p class="ma-0">{{ localRating.quality }}</p>
          </div>
        </li>
        <li class="mb-10">
          <p>
            3. Overall, how would you rate the {{ contractor.name }}'s
            performance on this task
          </p>
          <div class="d-flex align-center justify-space-between">
            <v-rating
              v-model="localRating.performance"
              background-color="info"
              color="yellow accent-4"
              dense
              half-increments
              hover
              size="20"
              @input="handleRatingInput"
            ></v-rating>
            <p class="ma-0">{{ localRating.performance }}</p>
          </div>
        </li>
      </ul>

      <ul v-if="errors.length" class="errors | pa-0 error--text">
        <li v-for="(error, index) in errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn class="mb-2" color="error" outlined @click="$emit('close')">{{
        $t('cancel')
      }}</v-btn>
      <v-btn class="mb-2" color="primary" @click="handleSave">{{
        rating ? $t('update') : $t('save')
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'RatingModal',
  props: {
    contractor: {
      type: Object,
      default: () => ({
        name: 'Yhonka',
        fullName: '',
        lastName: '',
        avatar: null,
      }),
    },

    taskType: { type: String, required: true },
    orderId: { type: String, required: true },
    taskId: { type: String, required: true },
    reqId: { type: String, required: true },
    processTime: { type: String, required: true },
    rating: { type: Object, default: () => null },
  },
  data() {
    return {
      localRating: {
        time: 0,
        performance: 0,
        quality: 0,
      },

      errors: [],
    }
  },
  mounted() {
    if (this.rating) {
      this.localRating = { ...this.rating.rating }
    }
  },
  methods: {
    handleRatingInput() {
      this.errors = []
    },
    validate() {
      const errors = []
      if (!this.localRating.time) {
        errors.push('Please rate time')
      }
      if (!this.localRating.quality) {
        errors.push('Please rate quality')
      }
      if (!this.localRating.performance) {
        errors.push('Please rate performance')
      }

      if (errors.length) {
        this.errors = errors
        return false
      }

      return true
    },
    async handleSave() {
      if (!this.validate()) {
        return
      }
      try {
        this.loading = true

        await this.$store.dispatch('ratings/set_rating', {
          ...(this.rating && { ratingId: this.rating.id }),
          contractorUid: this.contractor.uid,
          orderId: this.orderId,
          taskId: this.taskId,
          processTime: this.processTime,
          reqId: this.reqId,
          rating: this.localRating,
          taskType: this.taskType,
        })

        this.$mainAlertSuccess('Rating submited')
        this.$emit('close')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)

        this.$mainAlertError(
          'There was an error, please try again. If error persists, please contact tecnical support'
        )
      } finally {
        this.loading = true
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
