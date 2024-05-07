<template>
  <div class="container-action-details | text-center">
    <v-menu
      v-model="showColumns"
      offset-y
      min-width="500px"
      left
      nudge-bottom="20"
      transition="slide-y-transition"
      :close-on-content-click="false"
      :close-on-click="validateShow && validateHide"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn text x-small v-bind="attrs" v-on="on">
          <span class="white--text"
            ><v-icon small v-bind="attrs" v-on="on">
              mdi-format-columns
            </v-icon>
            {{ $t('columns') }}
          </span>
        </v-btn>
      </template>
      <v-card min-height="350">
        <v-row no-gutters>
          <v-col cols="6">
            <div
              class="container-columnsShow | pa-4 pr-2"
              @dragover="dragOver($event)"
              @drop="handleDrop($event, 'Show')"
            >
              <span>{{ $t('show') }}</span>
              <div class="columns | mt-2">
                <div
                  v-for="(column, index) in columnsShow"
                  :id="column.text"
                  :key="index"
                  ref="columnsShow"
                  draggable="true"
                  class="columnsItem"
                  @dragstart="handleDragStart($event, column, index, 'Show')"
                >
                  <h5 class="subtitle-2 pt-1 pl-2 column">
                    {{ column.text }}
                  </h5>
                  <v-divider
                    v-if="index !== columnsShow.length - 1"
                    class="mt-1"
                  ></v-divider>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="6">
            <div
              class="container-columnsHide | pa-4 pl-2"
              @dragover="dragOver($event)"
              @drop="handleDrop($event, 'Hide')"
            >
              <span>{{ $t('hide') }}</span>
              <div class="columns | mt-2">
                <div
                  v-for="(column, index) in columnsHide"
                  :id="column.text"
                  :key="index"
                  ref="columnsHide"
                  draggable="true"
                  class="columnsItem"
                  @dragstart="handleDragStart($event, column, index, 'Hide')"
                >
                  <h5 class="subtitle-2 pt-1 pl-2 column">{{ column.text }}</h5>
                  <v-divider
                    v-if="index !== columnsHide.length - 1"
                    class="mt-1"
                  ></v-divider>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-card-actions class="d-flex justify-end pt-2 pb-5">
          <v-btn class="mr-4" color="error" dense outlined @click="cancel()">{{
            $t('cancel')
          }}</v-btn>
          <v-btn
            class="mr-4"
            color="secondary"
            dense
            :disabled="validateShow && validateHide"
            :loading="loading"
            @click="handleSendColumns()"
            >{{ $t('save') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'ColumnsDetails',
  // props: {
  //   headersDefault: { type: Array, default: () => [] },
  // },
  data() {
    return {
      columnsShow: [],
      columnsHide: [],
      showColumns: false,
      columnMove: null,
      loading: false,
    }
  },
  computed: {
    headersSelected() {
      return this.$store.state.auth.user.preferences.headers
    },
    orderProperties() {
      return this.$store.state.home.orderProperties
    },
    showHeaders() {
      if (this.headersSelected && this.headersSelected.length) {
        return this.headersSelected
      }
      return this.headersDefault
    },
    hideHeaders() {
      if (!this.orderProperties || !this.columnsShow) {
        return []
      }
      return this.orderProperties.filter((property) => {
        return !this.columnsShow
          .map((column) => column.text)
          .includes(property.text)
      })
    },
    validateShow() {
      const column = this.columnsShow.map((c) => {
        const { ...columns } = c
        return columns
      })
      return this._.isEqual(column, this.showHeaders)
    },
    validateHide() {
      const column = this.columnsHide.map((c) => {
        const { ...columns } = c
        return columns
      })
      return this._.isEqual(column, this.hideHeaders)
    },
    headersDefault() {
      const headers = [
        {
          text: 'WO #',
          value: 'woNumber',
          width: '10%',
          align: 'left',
          sortable: true,
        },
        {
          text: 'Due Date',
          value: 'dateDueFormatted',
          width: '10%',
          align: 'center',
          cellClass: ['min-width-large'],
          sortable: true,
          // sort: (a, b) => {
          //   const [aMonth, aDay, aYear] = a.split('-')
          //   const [bMonth, bDay, bYear] = b.split('-')
          //   const aTimestamp = new Date(aYear, aMonth - 1, aDay)
          //   const bTimestamp = new Date(bYear, bMonth - 1, bDay)
          //   if (aTimestamp < bTimestamp) {
          //     return -1
          //   } else if (aTimestamp > bTimestamp) {
          //     return 1
          //   } else return 0
          // },
        },
        {
          text: 'Address',
          value: 'address',
          width: '15%',
          align: 'left',
          cellClass: ['truncate'],
          sortable: true,
        },
        {
          text: 'City',
          value: 'city',
          width: '15%',
          align: 'left',
          sortable: true,
          cellClass: ['min-width-small'],
        },
        {
          text: 'Zip',
          value: 'zip',
          width: '15%',
          align: 'center',
          cellClass: ['min-width'],
          sortable: true,
        },
        {
          text: 'Work Type',
          value: 'workType',
          width: '10%',
          align: 'left',
          cellClass: ['truncate'],
          sortable: true,
        },
        {
          text: 'Contractors',
          value: 'contractorList',
          cellClass: ['min-width'],
          align: 'center',
          sortable: true,
        },
        {
          text: 'Status',
          value: 'status',
          width: '10%',
          align: 'center',
          cellClass: ['truncate'],
          sortable: true,
        },
      ]
      return headers
    },
  },

  watch: {
    showHeaders: {
      handler() {
        this.columnsShow = JSON.parse(JSON.stringify(this.showHeaders))
      },
      deep: true,
    },
    hideHeaders: {
      handler() {
        if (this.columnsHide && !this.columnsHide.length) {
          this.columnsHide = JSON.parse(JSON.stringify(this.hideHeaders))
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.columnsShow = JSON.parse(JSON.stringify(this.showHeaders))
    this.columnsHide = JSON.parse(JSON.stringify(this.hideHeaders))
  },

  methods: {
    handleDrop(event, type) {
      const afterElement = this.getDrafAfterElement(type, event.clientY)

      // Cuando se mueve un elemento a otra columna y la otra no tiene elementos
      if (type !== this.columnMove.type && type === 'Hide' && !afterElement) {
        this.columnsShow.splice(this.columnMove.index, 1)
        this.columnsHide.push(this.columnMove.column)
      }
      if (type !== this.columnMove.type && type === 'Show' && !afterElement) {
        this.columnsHide.splice(this.columnMove.index, 1)
        this.columnsShow.push(this.columnMove.column)
      }
      // Cuando se mueve un elemento a otra columna y la otra columna tiene elementos
      if (type !== this.columnMove.type && type === 'Show' && afterElement) {
        const indexToElement = this.columnsShow
          .map((c) => c.text)
          .indexOf(afterElement.id)
        if (indexToElement > -1) {
          this.columnsHide.splice(this.columnMove.index, 1)
          this.columnsShow.splice(indexToElement, 0, this.columnMove.column)
        }
      }
      if (type !== this.columnMove.type && type === 'Hide' && afterElement) {
        const indexToElement = this.columnsHide
          .map((c) => c.text)
          .indexOf(afterElement.id)

        if (indexToElement > -1) {
          this.columnsShow.splice(this.columnMove.index, 1)
          this.columnsHide.splice(indexToElement, 0, this.columnMove.column)
        }
      }
      // Cuando se mueve un elemento en su misma columna
      if (type === this.columnMove.type && type === 'Show' && afterElement) {
        const indexToElement = this.columnsShow
          .map((c) => c.text)
          .indexOf(afterElement.id)
        if (indexToElement > -1) {
          this.columnsShow.splice(this.columnMove.index, 1)
          this.columnsShow.splice(indexToElement, 0, this.columnMove.column)
        }
      }
      if (type === this.columnMove.type && type === 'Hide' && afterElement) {
        const indexToElement = this.columnsHide
          .map((c) => c.text)
          .indexOf(afterElement.id)
        if (indexToElement > -1) {
          this.columnsHide.splice(this.columnMove.index, 1)
          this.columnsHide.splice(indexToElement, 0, this.columnMove.column)
        }
      }
      // Cuando se mueve un elemento a la misma columna pero al final, es decir que no tiene afterElement
      if (type === this.columnMove.type && type === 'Hide' && !afterElement) {
        this.columnsHide.splice(this.columnMove.index, 1)
        this.columnsHide.push(this.columnMove.column)
      }
      if (type === this.columnMove.type && type === 'Show' && !afterElement) {
        this.columnsShow.splice(this.columnMove.index, 1)
        this.columnsShow.push(this.columnMove.column)
      }
    },
    getDrafAfterElement(type, y) {
      const columnsDivs = this.$refs[`columns${type}`]

      if (!columnsDivs) {
        return null
      }
      return columnsDivs.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect()
          const offset = y - box.top - box.height / 2
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child }
          } else {
            return closest
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element
    },
    dragOver(event) {
      event.preventDefault()
    },
    handleDragStart(event, column, index, type) {
      this.columnMove = {
        column,
        type,
        index,
      }
    },
    async handleSendColumns() {
      const headers = this.columnsShow
      this.loading = true
      try {
        await this.$store.dispatch('home/set_headersTable', headers)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
        this.showColumns = false
      }
    },
    cancel() {
      this.showColumns = false
      this.columnsShow = JSON.parse(JSON.stringify(this.showHeaders))
      this.columnsHide = JSON.parse(JSON.stringify(this.hideHeaders))
    },
  },
}
</script>

<style lang="scss" scoped>
.columns {
  background-color: var(--v-terciary-base);
  border-radius: 5px;
  max-height: 310px;
  min-height: 310px;
  overflow: scroll;
}
.columns::-webkit-scrollbar {
  display: none;
}
.column {
  cursor: move;
}
</style>
