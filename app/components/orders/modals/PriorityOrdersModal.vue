<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('selectPriority') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="priority"
                :items="priorityOptionsFormatted"
                :label="$t('priority')"
                dense
                outlined
              >
                <!-- eslint-disable-next-line -->
                <template v-slot:item="{ item }">
                  <v-list-item-icon>
                    <v-icon
                      :color="
                        $getCategoryColor({
                          category: item.text,
                          className: true,
                        })
                      "
                      >mdi-flag</v-icon
                    >
                  </v-list-item-icon>

                  <v-list-item-title v-text="item.text"></v-list-item-title>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn outlined color="error" class="mb-2 mr-2" @click="handleClose"
          >{{ $t('close') }}
        </v-btn>
        <v-btn color="secondary" class="mb-2 mr-2" @click="handleSave">
          {{ $t('setCategory') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { CATEGORY_OPTIONS } from '@/utils/dictionaries'
export default {
  name: 'PriorityOrdersModal',
  props: {
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      dialog: false,
      priority: null,
      CATEGORY_OPTIONS: null,
    }
  },
  computed: {
    priorityOptions() {
      return this.$store.state.categoryOptions
    },
    priorityOptionsFormatted() {
      return this.priorityOptions
        .map((option) => {
          return {
            value: option,
            text: option.title,
          }
        })
        .sort((a, b) => {
          return a.value.order < b.value.order
        })
    },
  },
  watch: {
    show(val) {
      this.dialog = val
    },
  },

  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },

  async mounted() {
    if (!this.priorityOptions.length) {
      try {
        this.loading = true
        await this.$store.dispatch('get_categoryOptions')
        this.loading = false
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    }
  },

  methods: {
    handleClose() {
      this.priority = null
      this.$emit('close')
    },
    handleSave() {
      this.$emit('save', this.priority.title)
      this.priority = null
    },
  },
}
</script>

<style lang="scss" scoped></style>
