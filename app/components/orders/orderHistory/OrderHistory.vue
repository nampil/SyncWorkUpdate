<template>
  <div class="order-history elevation-2">
    <v-toolbar dark color="secondary" dense class="toolbar | mt-0">
      <v-toolbar-title
        >{{ $t('orderHistory') }} WO#: {{ order.woNumber }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close-circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <div class="history-content">
      <v-data-table
        :headers="headers"
        :items="orderHistoryFormatted"
        class="elevation-0 h-100"
        item-key="id"
        show-expand
        dense
        fixed-header
        height="80%"
        :options="{
          itemsPerPage: 15,
        }"
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:expanded-item="{ headers, item }">
          <td v-if="item.changes" :colspan="headers.length">
            <div
              v-for="(change, j) in item.changes"
              :key="j"
              class="item-change pl-4"
            >
              <div v-if="change && change.type">
                <div class="">{{ j }} - {{ change.type }}</div>

                <div v-if="change.oldValue">
                  {{ $t('oldValue') }} {{ change.oldValue }}
                </div>
                <div v-if="change.newValue">
                  <!-- Cuando se crea un task-->
                  <div v-if="typeof change.newValue === 'object'">
                    <!-- {{ $t('newValue') }} -->
                    {{ $t('data') }}:
                    <div
                      v-for="(newVal, key) in change.newValue"
                      :key="key"
                      class="pl-6"
                    >
                      <div
                        v-if="
                          key !== 'updatedBy' &&
                          key !== 'updatedAt' &&
                          key !== 'createdBy' &&
                          key !== 'createdAt' &&
                          key !== 'pictures' &&
                          key !== 'areasInReports' &&
                          key !== 'itemsForInvoices'
                        "
                      >
                        {{ $t(key) }}: {{ newVal }}
                      </div>
                      <div v-if="key === 'createdBy'">
                        {{ $t('Created By') }}: {{ newVal.fullName }}
                      </div>
                      <div v-if="key === 'createdAt'">
                        {{ $t('Created At') }}:
                        {{ $formatDate(newVal, { time: true }) }}
                      </div>

                      <div v-if="key === 'pictures' && newVal.length">
                        <div class="previews">
                          <p class="d-flex align-start">
                            {{ $t('pictures') }}:
                          </p>
                          <div
                            v-for="(pic, p) in newVal"
                            :key="p"
                            class="preview text-right"
                          >
                            <img
                              v-if="pic.type.includes('image')"
                              :src="pic.url"
                              alt=""
                              height="100px"
                              width="100px"
                            />
                            <div
                              v-if="pic.type.includes('pdf')"
                              class="file-preview d-flex align-center justify-center"
                            >
                              <v-icon large>mdi-file-pdf-box</v-icon>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="key === 'areasInReports' && newVal.length"
                        class="d-flex flex-wrap wraper"
                      >
                        <span> {{ $t('areas') }}: </span>
                        <div v-for="(area, c) in newVal" :key="c" class="ml-1">
                          <span
                            >{{ area
                            }}{{ c !== newVal.length - 1 ? ',' : '.' }}</span
                          >
                        </div>
                      </div>
                      {{ key }}
                      <div
                        v-if="key === 'itemsForInvoices' && newVal.length"
                        class="d-flex flex-wrap wraper"
                      >
                        <span> {{ $t('itemsForInvoices') }}: </span>
                        <div v-for="(i, c) in newVal" :key="c" class="ml-1">
                          <span
                            >{{ i.title
                            }}{{ c !== newVal.length - 1 ? ',' : '.' }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else>{{ $t('newValue') }} {{ change.newValue }}</div>
                </div>
              </div>
              <div v-else>
                <div v-for="(value, key) in change" :key="key" class="">
                  <div v-if="value && value.type">
                    <span v-if="key !== 'id' && j !== 'contractorsUids'">
                      {{ j + ' ' + key }} - {{ value.type }}
                    </span>

                    <div v-if="value.oldValue">
                      {{ $t('oldValue') }} {{ value.oldValue }}
                    </div>
                    <div v-if="value.newValue && j !== 'contractorsUids'">
                      <div v-if="typeof value.newValue === 'object'">
                        <!-- {{ $t('newValue') }} aqui 1 -->
                        {{ $t('data') }}:
                        <div class="d-flex flex-wrap ml-6">
                          <div
                            v-for="(newVal, l) in value.newValue"
                            :key="l"
                            class="mr-2"
                          >
                            <span
                              v-if="j === 'contractors' && l === 'fullName'"
                            >
                              {{ $t(l) }}: {{ newVal }}
                            </span>
                            <span v-else-if="j !== 'contractors'">
                              {{ l }}: {{ newVal }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div v-else-if="key !== 'id'">
                        {{ $t('data') }}:
                        <!-- {{ $t('newValue') }} {{ value.newValue }} -->
                        <div class="pl-6">
                          {{ isNaN(key) ? $t(key) : key }}:
                          {{ value.odlValue }}
                          <v-icon small>mdi-arrow-right-thin</v-icon>
                          {{ value.newValue }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div v-for="(v, k) in value" :key="k">
                      <div v-if="v.type">
                        <span v-if="j !== 'contractors'">
                          {{ isNaN(key) ? $t(key) : key }} - {{ v.type }}
                        </span>
                        <div v-else-if="k === 'fullName'">
                          <span> {{ $t(j) }} - {{ v.type }}</span>
                          <br />
                          <span>{{ $t('data') }}:</span>
                        </div>

                        <div v-if="v.oldValue">
                          {{ $t('oldValue') }} {{ v.oldValue }}
                        </div>
                        <div v-if="v.newValue">
                          <div
                            v-if="
                              typeof v.newValue === 'object' &&
                              j !== 'contractors'
                            "
                          >
                            <!-- {{ $t('newValue') }} -->
                            {{ $t('data') }}:
                            <div
                              v-for="(newVal, l) in v.newValue"
                              :key="l"
                              class="pl-6"
                            >
                              <div v-if="l !== 'id'" class="mr-2">
                                {{ isNaN(l) ? $t(l) : l }}: {{ newVal }}
                              </div>
                            </div>
                          </div>
                          <div v-else class="ml-6">
                            <span v-if="j !== 'contractors'">
                              {{ $t('newValue') }} {{ v.newValue }}
                            </span>
                            <span v-else-if="k === 'fullName'"
                              >{{ $t(k) }}: {{ v.odlValue }}
                              <v-icon small>mdi-arrow-right-thin</v-icon>
                              {{ v.newValue }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- <div v-if="key === 'itemsForInvoices'">
                    Items For Invoices - Updated
                    <div>
                      Data:
                      <div v-for="(newVal, l) in value" :key="l" class="pl-6">
                        <div v-for="(val, i) in Object.keys(newVal)" :key="i">
                          {{ val }} :
                          <span v-if="newVal.price && newVal.price.newValue">{{
                            newVal.price.newValue
                          }}</span>
                          <v-icon small>mdi-arrow-right-thin</v-icon>
                          <span v-if="newVal.price && newVal.price.odlValue">{{
                            newVal.price.odlValue
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div> -->
                </div>
              </div>
            </div>
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'OrderHistory',
  props: {
    order: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      expanded: [],
      headers: [
        {
          text: this.$t('date'),
          value: 'updatedAt',
          width: '30%',
          sortable: true,
        },
        {
          text: this.$t('user'),
          value: 'user',

          sortable: true,
        },
        {
          text: this.$t('type'),
          value: 'type',
          width: '25%',
          sortable: true,
        },
        { text: '', value: 'data-table-expand' },
      ],
    }
  },
  computed: {
    ...mapState('orderHistory', {
      orderHistory: (state) => state.history,
    }),
    orderHistoryFormatted() {
      return this.orderHistory.map((item) => {
        return {
          ...item,
          user: item.user ? item.user.fullName : '',
          type: item.type ? item.type : 'change',
          ...(item.changes && { changes: item.changes }),
          updatedAt: item.updatedAt.toDate().toLocaleString(),
        }
      })
    },
  },
  watch: {
    order() {
      this.getHistory()
    },
  },
  mounted() {
    this.getHistory()
  },

  beforeDestroy() {
    this.$store.commit('orderHistory/flush_state')
  },

  methods: {
    async getHistory() {
      try {
        this.loading = true
        await this.$store.dispatch('orderHistory/get_history', this.order.id)
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.loading = false
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    getValue(item) {
      if (typeof item === 'object' && item.type === undefined) {
        return Object.keys(item)
          .filter((key) => {
            return JSON.stringify(this.getValue(item[key])) !== '{}'
          })
          .map((key) => {
            return {
              property: key,
              value: this.getValue(item[key]),
            }
          })
      }
      if (Object.prototype.toString.call(item) === '[object Array]') {
        return item
          .filter((i) => {
            return JSON.stringify(i) !== '{}'
          })
          .map((i) => {
            return this.getValue(i)
          })
      }
      return item
    },
  },
}
</script>

<style lang="scss" scoped>
.order-history {
  position: absolute;
  bottom: 0;
  right: 1rem;
  background-color: #fff;
  width: 50vw;
  min-width: 600px;
  max-height: 50vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 150ms ease-in-out;
  font-size: 0.9rem;
  z-index: 10;
}
.toolbar {
  flex: 0 0 auto;
  height: 48px;
}
.history-content {
  flex: 1 1 100%;
  width: 100%;
  overflow-y: auto;
  height: calc(100% - 48px);
}
.history-item {
  &:nth-child(odd) {
    background-color: #f4f4f4;
  }
}
.item-change {
  border-bottom: 1px solid #ddd;
}
.previews {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  .preview {
    width: 30px;
    height: 30px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    .file-preview {
      height: 100%;
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }
}
</style>
