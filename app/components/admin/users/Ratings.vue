<template>
  <div>
    <v-select
      v-model="filter"
      :items="filterOptions"
      label="Ratings for"
    ></v-select>

    <v-dialog
      v-model="showSelectRange"
      width="290px"
      transition="dialog-transition"
    >
      <v-card>
        <v-date-picker v-model="dates" range scrollable></v-date-picker>
      </v-card>
    </v-dialog>
    <div class="rounded-lg pa-4 terciary">
      <canvas ref="lineChart"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
export default {
  name: 'AminRatings',

  data() {
    return {
      loading: false,
      showSelectRange: false,
      chart: null,
      dates: [],
      ratings: [],
      fromDate: '',
      toDate: '',
      filter: 'default',
      filterOptions: [
        { text: 'Last 30 days', value: 'default' },
        {
          text: 'Last 7 days',
          value: 'week',
        },
        {
          text: 'Select Range',
          value: 'range',
        },
      ],
    }
  },
  computed: {
    isThemeDark() {
      return this.$vuetify.theme.dark
    },
    chartData() {
      const ratingsTime = this.ratings.map((r) => {
        return r.rating.time
      })
      const ratingsPerformance = this.ratings.map((r) => {
        return r.rating.performance
      })
      const ratingsQuality = this.ratings.map((r) => {
        return r.rating.quality
      })

      const labels = this.ratings.map((r) => {
        const date = r.ratingAt.toDate()
        const dateStr = new Intl.DateTimeFormat('en-US').format(date)
        return dateStr
      })
      const color = this.isThemeDark
        ? this.$vuetify.theme.themes.dark
        : this.$vuetify.theme.themes.light

      return {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Time',
              data: ratingsTime,
              fill: false,
              borderColor: color.success,
              tension: 0.5,
            },
            {
              label: 'Performance',
              data: ratingsPerformance,
              fill: false,
              borderColor: color.primary,
              tension: 0.5,
            },
            {
              label: 'Quality',
              data: ratingsQuality,
              fill: false,
              borderColor: color.error,
              tension: 0.5,
            },
          ],
        },
        options: {
          scales: {
            y: {
              min: 0,
            },
          },

          responsive: true,
          plugins: {
            customCanvasBackgroundColor: {
              color: 'lightGreen',
            },
            legend: {
              position: 'bottom',
              labels: {
                color: this.$vuetify.theme.dark ? '#fff' : '#333',
              },
            },
            title: {
              display: true,
              text: 'Star Chart',
            },
          },
        },
      }
    },
  },
  watch: {
    isThemeDark() {
      this.showChart()
    },
    dates(val) {
      if (val && !val[1]) {
        return
      }

      const _fromDate = val[0]
      const [fromY, fromM, fromD] = _fromDate.split('-')
      this.fromDate = new Date(Number(fromY), Number(fromM) - 1, Number(fromD))

      const _toDate = val[1]
      const [toY, toM, toD] = _toDate.split('-')
      this.toDate = new Date(Number(toY), Number(toM) - 1, Number(toD))

      this.getRatings()
    },
    filter(val) {
      if (val === 'range') {
        this.showSelectRange = true
        return
      }

      if (val === 'week') {
        this.fromDate = new Date(new Date().setDate(new Date().getDate() - 7))
      }

      this.getRatings()
    },
  },
  mounted() {
    this.getRatings()
  },
  methods: {
    async getRatings() {
      this.ratings = []

      try {
        this.loading = true

        this.ratings = await this.$store.dispatch(
          'ratings/get_ratingsByUserByDates',
          {
            userId: this.$route.params.uid,
            fromDate: this.fromDate,
            toDate: this.toDate,
          }
        )
        this.showChart()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(
          'There was an error while getting ratings for user'
        )
      } finally {
        this.loading = false
      }
    },
    showChart() {
      const ctx = this.$refs.lineChart

      if (this.chart) {
        this.chart.destroy()
      }

      Chart.register(...registerables)
      this.chart = new Chart(ctx, this.chartData)
    },
  },
}
</script>

<style lang="scss" scoped></style>
