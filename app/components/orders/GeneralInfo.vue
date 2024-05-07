<template>
  <div
    id="generalInfoContainer"
    class="general-info-container"
    @dragenter="handleDragenter($event)"
    @dragover="handleDragover($event)"
    @dragleave="handleDragleave($event)"
    @drop="handleDropTask"
  >
    <transition name="grow">
      <Notes
        v-if="showNotePad"
        :order-id="order.id"
        :closing="closingNotes"
        @close-notes="handleCloseNotes"
      />
    </transition>
    <v-form ref="generalInfoForm">
      <v-row class="mt-3 mb-1">
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.woNumber"
                outlined
                dense
                label="WO#"
                readonly
                :disabled="localOrder.edited"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.address"
                outlined
                dense
                hide-details="auto"
                :label="$t('address')"
                :rules="[rules.required]"
                :disabled="localOrder.edited"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.city"
                outlined
                dense
                hide-details="auto"
                :label="$t('city')"
                :rules="[rules.required]"
                :disabled="localOrder.edited"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.county"
                outlined
                dense
                hide-details="auto"
                :label="$t('county')"
                :rules="[rules.required]"
                :disabled="localOrder.edited"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-combobox
                v-model="localOrder.state"
                outlined
                :items="statesList"
                dense
                hide-details="auto"
                :label="$t('state')"
                :rules="[rules.required]"
                :disabled="localOrder.edited"
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.zip"
                outlined
                dense
                hide-details="auto"
                :label="$t('zip')"
                :rules="[rules.required]"
                :disabled="localOrder.edited"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="localOrder.client"
                :items="clientsList"
                item-text="title"
                item-value="title"
                :label="$t('client')"
                dense
                outlined
                :rules="[rules.required]"
                hide-details="auto"
                :disabled="localOrder.edited"
              >
              </v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="localOrder.loanType"
                :items="loanTypeOptions"
                :label="$t('loanType')"
                dense
                outlined
                :rules="[rules.required]"
                hide-details="auto"
                :disabled="localOrder.edited"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3"
              ><v-text-field
                v-model="localOrder.customer"
                outlined
                dense
                :label="$t('customer')"
                hide-details="auto"
                :disabled="localOrder.edited"
              ></v-text-field
            ></v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.dateDueStr"
                outlined
                dense
                :label="$t('dateDue')"
                readonly
                :disabled="localOrder.edited"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3"
              ><v-text-field
                v-model="localOrder.workType"
                outlined
                dense
                :label="$t('workType')"
                hide-details="auto"
                :disabled="localOrder.edited"
              ></v-text-field
            ></v-col>
            <v-col cols="12" md="3">
              <v-menu
                v-model="estimatedCompleteDateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
                :disabled="localOrder.edited"
              >
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="localOrder.estimatedCompleteDate"
                    outlined
                    dense
                    :label="$t('estimateCompletionDate')"
                    hide-details="auto"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    :disabled="localOrder.edited"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="localOrder.estimatedCompleteDate"
                  @input="estimatedCompleteDateMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" md="3"
              ><v-combobox
                v-model="localOrder.category"
                :items="categoryOptions"
                outlined
                dense
                :label="$t('category')"
                hide-details="auto"
                :disabled="localOrder.edited"
              ></v-combobox
            ></v-col>

            <v-col cols="12" md="3"
              ><v-text-field
                v-model="localOrder.lockBox"
                outlined
                dense
                :label="$t('lockbox')"
                hide-details="auto"
                :disabled="localOrder.edited"
              ></v-text-field
            ></v-col>
            <v-col cols="12" md="3"
              ><v-text-field
                v-model="localOrder.keyCode"
                outlined
                dense
                :label="$t('keyCode')"
                hide-details="auto"
                :disabled="localOrder.edited"
              ></v-text-field
            ></v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="localOrder.vps"
                outlined
                dense
                label="VPS"
                hide-details="auto"
                :disabled="localOrder.edited"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="4" class="append-row d-flex align-start pa-0">
          <div class="append-col">
            <div
              ref="dropzone"
              :class="[
                'foh-picture-box',
                { 'show-preview': !!fohPreview, disabled: localOrder.edited },
              ]"
              @drop.prevent="handleDrop"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
            >
              <div :class="['label', { dark: $vuetify.theme.dark }]">
                <label class="v-label">FOH {{ $t('picture') }} </label>
              </div>
              <div v-if="fohPreview" class="preview">
                <v-btn
                  small
                  icon
                  class="closeBtn"
                  :disabled="localOrder.edited"
                  @click="handleCloseFOH"
                >
                  <v-icon small color="red">mdi-close</v-icon>
                </v-btn>
                <img :src="fohPreview.url" alt="" />
              </div>
              <div v-else class="no-preview">
                <label for="fohImg" class="pointer">
                  <v-icon x-large>mdi-camera</v-icon>
                  <input
                    id="fohImg"
                    type="file"
                    :disabled="localOrder.edited"
                    style="display: none"
                    accept=".jpg, .jpeg, .png"
                    @change="handleOptionalFile"
                  />
                </label>
              </div>
            </div>
          </div>
          <div class="append-col">
            <div
              :class="[
                'assignedTo-box',
                {
                  'show-content':
                    localOrder.assigned || localOrder.contractors.length,
                  disabled: localOrder.edited,
                },
              ]"
            >
              <div :class="['label', { dark: $vuetify.theme.dark }]">
                <label class="v-label"
                  >{{ $t('assignedTo') }}
                  <v-tooltip open-delay="600" content-class="small" top>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="white--text"
                        small
                        icon
                        color="primary"
                        :disabled="localOrder.edited"
                        v-bind="attrs"
                        v-on="on"
                        @click="showSelectContractor = true"
                        ><v-icon>mdi-pencil-outline</v-icon></v-btn
                      >
                    </template>
                    <span>{{ $t('addContractors') }}</span>
                  </v-tooltip>
                </label>
              </div>
              <ul class="contractors-list">
                <li
                  v-for="item in localOrder.contractors"
                  :key="item.uid"
                  class="contractors-item d-flex align-center py-1"
                >
                  <div>{{ item.fullName }}</div>
                  <v-spacer></v-spacer>
                  <v-btn
                    x-small
                    icon
                    class="contractor-closeBtn"
                    @click="handleRemoveContractor(item)"
                  >
                    <v-icon x-small color="red">mdi-close</v-icon>
                  </v-btn>
                </li>
              </ul>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-form>

    <div
      class="action-container d-flex flex-wrap justify-center justify-md-between mb-4"
    >
      <v-spacer></v-spacer>
      <v-btn
        class="mr-4 white--text"
        small
        color="error"
        outlined
        :disabled="loading || !local_needToSave"
        @click="handleCancel"
        >{{ $t('cancel') }}</v-btn
      >
      <!-- :disabled="!local_needToSave || validateCompleteAddress"-->
      <v-btn
        class="mr-4 white--text"
        small
        color="primary"
        :loading="loading && local_needToSave"
        :disabled="localOrder.edited"
        @click="handleSaveGaneralInfo"
        >{{ $t('save') }}</v-btn
      >
    </div>

    <v-divider class="mb-6"></v-divider>

    <div class="d-flex mb-4">
      <v-spacer></v-spacer>
      <v-btn
        class="mr-4 white--text"
        small
        color="primary"
        :disabled="localOrder.edited"
        @click="addOrderTemplate = !addOrderTemplate"
      >
        {{ $t('use order template') }}</v-btn
      >
    </div>

    <v-row>
      <v-col cols="6">
        <v-row>
          <v-col v-for="jt in jobsTypes" :key="jt.title" cols="12" class="mb-8">
            <div class="option-bar d-flex mb-2">
              <v-menu offset-y bottom rounded>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on: menu, attrs }">
                  <v-tooltip open-delay="600" content-class="small" bottom>
                    <!-- eslint-disable-next-line -->
                    <template v-slot:activator="{ on: tooltip }">
                      <v-btn
                        text
                        small
                        color="primary"
                        icon
                        :disabled="localOrder.edited"
                        v-bind="attrs"
                        v-on="{ ...tooltip, ...menu }"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <span>{{
                      jt.type !== JOB_TYPES.inspections
                        ? $t('addTasks')
                        : $t('editInspections')
                    }}</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item @click="handleAddTask(jt)">
                    <v-list-item-title>
                      <v-icon class="mr-2 mb-1" dense>{{
                        jt.type !== JOB_TYPES.inspections
                          ? 'mdi-plus-circle'
                          : 'mdi-pencil-circle'
                      }}</v-icon>
                      {{
                        jt.type !== JOB_TYPES.inspections
                          ? `Add ${$t(jt.type)}`
                          : `Edit ${$t(jt.type)}`
                      }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="jt.type === JOB_TYPES.workToDos"
                    @click="handleAddWinterization(jt)"
                  >
                    <v-list-item-title>
                      <v-icon class="mr-2 mb-1" dense>{{
                        jt.type !== JOB_TYPES.inspections
                          ? 'mdi-plus-circle'
                          : 'mdi-pencil-circle'
                      }}</v-icon>
                      Add Winterization</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>

              <h4 class="text-h6 ml-2">
                {{ $t(jt.title) }}
              </h4>

              <v-spacer></v-spacer>

              <span
                v-if="jt.type === JOB_TYPES.workToDos && totalPriceWorkToDos"
                class="mr-1 text-h6 info--text"
              >
                {{ 'Total Price: $' + totalPriceWorkToDos.toFixed(2) }}</span
              >
              <span
                v-if="jt.type === JOB_TYPES.allowables && totalPriceAllowables"
                class="mr-1 text-h6 info--text"
              >
                {{ 'Total Price: $' + totalPriceAllowables.toFixed(2) }}</span
              >
              <span
                v-if="
                  jt.type === JOB_TYPES.allowables &&
                  localOrder.allowablesPools.length &&
                  totalMaxValue
                "
                class="mr-2 text-h6 info--text"
              >
                {{ '/ $' + totalMaxValue }}</span
              >
            </div>
            <div
              v-if="jt.type === JOB_TYPES.workToDos && order.addWinterization"
              class="mb-8 px-2 py-4 terciary rounded d-flex justify-space-between"
            >
              <div class="d-flex gap-4 align-center">
                <v-icon small>mdi-alert</v-icon>
                <h4>Order is set to add winterization</h4>
              </div>
              <div class="actions">
                <v-tooltip open-delay="600" content-class="small" top>
                  <!-- eslint-disable-next-line -->
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      small
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="removeAddWinterization"
                    >
                      <v-icon small color="red">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('deleteTask') }}</span>
                </v-tooltip>
              </div>
            </div>
            <div
              v-if="
                jt.type === JOB_TYPES.allowables && localOrder.allowables.length
              "
              class="mt-4 mb-1"
            >
              {{ $t('tasksGenerated') }}
            </div>
            <v-row>
              <v-col
                v-for="(jobTask, i) in localOrder[jt.type]"
                :id="jobTask.id"
                :key="i"
                ref="tasks"
                cols="12"
                md="12"
              >
                <div
                  :draggable="!localOrder.edited"
                  @dragstart="handleDrag($event, jobTask, i, true)"
                  @dragend="handleDrag($event, jobTask, i, false)"
                >
                  <task-preview
                    :job-task="jobTask"
                    :type="jt"
                    :order-id="order.id"
                    :work-order-number="order.woNumber"
                    class="mb-2"
                    :disabled="localOrder.edited"
                    @delete="handleDeleteTask(jobTask)"
                    @edit="handleEditTask(jobTask, jt)"
                  />
                </div>
              </v-col>
            </v-row>
            <div
              v-if="
                jt.type === JOB_TYPES.allowables &&
                localOrder.allowablesPools.length
              "
              class="my-4 text--secondary text-small mb-1"
            >
              {{ $t('possibleTasks') }}
            </div>
            <v-row
              v-if="
                jt.type === JOB_TYPES.allowables &&
                localOrder.allowablesPools.length
              "
            >
              <v-col
                v-for="(ap, i) in localOrder.allowablesPools"
                :id="ap.id"
                :key="ap.id"
                ref="tasksAp"
                cols="12"
                md="8"
              >
                <div
                  class="allowable-pool"
                  :draggable="!localOrder.edited"
                  @dragstart="handleDrag($event, ap, i, true)"
                  @dragend="handleDrag($event, ap, i, false)"
                >
                  <allowable-pool
                    :allowablepool="ap"
                    :disabled="localOrder.edited"
                    @edit="
                      handleEditTask(ap, {
                        title: 'allowablesPools',
                        type: 'allowablesPools',
                      })
                    "
                    @delete="handleDeleteTask(ap)"
                  >
                  </allowable-pool>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showAddWinterizationModal"
      scrollable
      :persistent="validatePersistent"
      max-width="1000px"
      transition="dialog-transition"
    >
      <add-winterization
        :order="localOrder"
        :job-type="jobTypeSelected"
        @close="handleCloseAddWinterization"
      />
    </v-dialog>

    <v-dialog
      v-model="addTaskModal"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task
        v-if="addTaskModal"
        :order="localOrder"
        :job-type="jobTypeSelected"
        :job-task-to-edit="jobTaskToEdit"
        @update-persistent="validatePersistent = $event"
        @close="handleCloseAddTask"
      />
    </v-dialog>
    <v-dialog
      v-model="addTaskInspections"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task-inspections
        v-if="addTaskInspections"
        :order="localOrder"
        @update-persistent="validatePersistent = $event"
        @close="handleCloseAddTaskInspection"
      />
    </v-dialog>
    <v-dialog
      v-model="addOrderTemplate"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-order-template
        v-if="addOrderTemplate"
        :order="localOrder"
        @update-persistent="validatePersistent = $event"
        @close="addOrderTemplate = !addOrderTemplate"
      />
    </v-dialog>
    <select-contractor
      :show="showSelectContractor"
      :contractors-order-uids="localOrder.contractors.map((c) => c.uid)"
      @close="showSelectContractor = false"
      @save="handleAssignOrders"
    />
    <loader-overlay v-if="loading" />
  </div>
</template>

<script>
import { JOB_TYPES } from '../../utils/dictionaries'
import LoaderOverlay from '../misc/LoaderOverlay.vue'
import AddTask from './task/AddTask.vue'
import SelectContractor from './modals/SelectContractor.vue'
import TaskPreview from './task/TaskPreview.vue'
import AllowablePool from './task/AllowablePool.vue'
import Notes from './notepad/Notes.vue'
import AddTaskInspections from './task/AddTaskInspections.vue'
import AddOrderTemplate from './AddOrderTemplate.vue'
import AddWinterization from './task/AddWinterization.vue'

export default {
  name: 'GeneralInfo',
  components: {
    TaskPreview,
    AddTask,
    SelectContractor,
    LoaderOverlay,
    Notes,
    AllowablePool,
    AddTaskInspections,
    AddOrderTemplate,
    AddWinterization,
  },
  props: {
    showNotePad: { type: Boolean, default: false },
    closingNotes: { type: Boolean, default: false },
    order: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      JOB_TYPES: null,
      estimatedCompleteDateMenu: false,
      showSelectContractor: false,
      jobTaskToEdit: {},
      loading: false,
      showAddWinterizationModal: false,
      addTaskModal: false,
      jobTypeSelected: null,
      jobsTypes: [
        { title: 'workToDos', type: 'workToDos' },
        { title: 'inspections', type: 'inspections' },
        { title: 'allowables', type: 'allowables' },
        { title: 'appointments', type: 'appointments' },
        { title: 'additionalInstructions', type: 'instructions' },
      ],
      rules: {
        required: (v) => !!v || 'Required',
      },
      fohFile: null,
      fohPreview: null,
      fohImgDelete: null,
      localOrder: {
        dateDue: null,
        dateDueStr: '',
        zip: '',
        contractors: [],
        address: '',
        orderNew: false,
        onHold: false,
        city: '',
        edited: false,
        county: '',
        woNumber: '',
        archive: false,
        photos: 0,
        workType: '',
        assigned: false,
        category: '',
        estimatedCompleteDate: '',
        customer: '',
        id: '',
        loanType: '',
        keyCode: '',
        vps: '',
        lockBox: '',
        assignedTo: [],
        fohImg: '',
        propertyId: '',
        inspections: [],
        allowables: [],
        allowablesPools: [],
        workToDos: [],
        tools: [],
        appointments: [],
        instructions: [],
      },
      statesList: [
        'AL',
        'AK',
        'AZ',
        'AR',
        'CA',
        'CO',
        'CT',
        'DE',
        'FL',
        'GA',
        'HI',
        'ID',
        'IL',
        'IN',
        'IA',
        'KS',
        'KY',
        'LA',
        'ME',
        'MD',
        'MA',
        'MI',
        'MN',
        'MS',
        'MO',
        'MT',
        'NE',
        'NV',
        'NH',
        'NJ',
        'NM',
        'NY',
        'NC',
        'ND',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VT',
        'VA',
        'WA',
        'WI',
        'WY',
        'WV',
      ],
      validatePersistent: false,
      addTaskInspections: false,
      addOrderTemplate: false,
    }
  },
  computed: {
    categoryOptions() {
      return this.$store.state.categoryOptions.map((option) => {
        return option.title
      })
    },
    clientsList() {
      return this.$store.state.clientsList
    },
    loanTypeOptions() {
      if (this.localOrder.client && this.clientsList.length) {
        const client = this.clientsList.find(
          (client) => client.title === this.localOrder.client
        )

        return client?.loanTypes ?? []
      }
      return []
    },
    localOrderFormatted() {
      const order = this.localOrder
      return {
        ...order,
        completeAddress: `${order.address}, ${order.city}, ${
          order.county || ''
        }  ${order.state || ''} - ${order.zip}`,
      }
    },
    validateCompleteAddress() {
      if (
        this.localOrder.address === '' ||
        this.localOrder.city === '' ||
        this.localOrder.zip === '' ||
        this.localOrder.state === '' ||
        this.localOrder.county === ''
      ) {
        return true
      }
      return false
    },
    totalPriceWorkToDos() {
      return this.localOrder.workToDos.reduce((acc, val) => {
        const items = val.itemsForInvoices || []
        const value = items.reduce((ac, item) => {
          const price = parseFloat(item.price)
          const qty = item.qty || 1
          const product = price * qty
          return ac + product
        }, 0)
        return acc + value
      }, 0)
    },
    totalPriceAllowables() {
      return this.localOrder.allowables.reduce((acc, val) => {
        const items = val.itemsForInvoices || []
        const value = items.reduce((ac, item) => {
          const price = parseFloat(item.price)
          const qty = item.qty || 1
          const product = price * qty
          return ac + product
        }, 0)
        return acc + value
      }, 0)
    },
    totalMaxValue() {
      return this.localOrder.allowablesPools
        .map((e) => e.maxValue)
        .reduce((acc, curr) => parseFloat(acc) + parseFloat(curr), 0)
    },
    needToSave: {
      get() {
        return this.$store.state.needToSave
      },
      set(val) {
        this.$store.commit('set_needToSave', val)
      },
    },
    sameWorkType() {
      return this.localOrder.workType !== this.order.workType
    },
    sameCategory() {
      return this.localOrder.category !== this.order.category
    },
    sameKeyCode() {
      return this.localOrder.keyCode !== this.order.keyCode
    },
    sameContractor() {
      return !this._.isEqual(
        this.localOrder.contractors,
        this.order.contractors
      )
    },
    sameLockbox() {
      return this.localOrder.lockBox !== this.order.lockBox
    },
    sameVps() {
      return this.localOrder.vps !== this.order.vps
    },
    sameEstimatedCompleteDate() {
      return (
        this.localOrder.estimatedCompleteDate !==
        this.order.estimatedCompleteDate
      )
    },
    sameAddress() {
      return this.localOrder.address !== this.order.address
    },
    sameCity() {
      return this.localOrder.city !== this.order.city
    },
    sameCounty() {
      return this.localOrder.county !== this.order.county
    },
    sameState() {
      return this.localOrder.state !== this.order.state
    },
    sameZip() {
      return this.localOrder.zip !== this.order.zip
    },
    fohFileNoNull() {
      return this.fohFile !== null
    },
    sameCustomer() {
      return this.localOrder.customer !== this.order.customer
    },
    sameLoanType() {
      return this.localOrder.loanType !== this.order.loanType
    },
    sameClient() {
      return this.localOrder.client !== this.order.client
    },
    sameFohImg() {
      return !this._.isEqual(this.localOrder.fohImg, this.order.fohImg)
    },
    local_needToSave() {
      return (
        this.sameCategory ||
        this.sameKeyCode ||
        this.sameContractor ||
        this.sameLockbox ||
        this.sameVps ||
        this.fohFileNoNull ||
        this.sameWorkType ||
        this.sameEstimatedCompleteDate ||
        this.sameAddress ||
        this.sameCity ||
        this.sameCounty ||
        this.sameState ||
        this.sameZip ||
        this.sameCustomer ||
        this.sameLoanType ||
        this.sameClient ||
        this.sameFohImg
      )
    },
    isInitialOrder() {
      return (
        [
          ...this.localOrder.workToDos,
          ...this.localOrder.allowables,
          ...this.localOrder.allowablesPools,
          ...this.localOrder.inspections,
        ].length === 0
      )
    },
  },
  watch: {
    local_needToSave: {
      handler(val) {
        this.needToSave = val
      },
      immediate: true,
    },
    order: {
      handler(val) {
        this.initialize(val)
      },
      deep: true,
    },
  },
  beforeDestroy() {
    this.$store.commit('order/flush_state')
  },
  created() {
    this.JOB_TYPES = JOB_TYPES
  },
  mounted() {
    this.initialize(this.order, true)
  },
  methods: {
    async removeAddWinterization() {
      try {
        this.loading = true
        await this.$store.dispatch('order/add_winterization', {
          orderId: this.order.id,
          addWinterization: false,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error removing winterization', error)
        this.$mainAlertError(
          'Error removing winterization, please try later. If problem persist, call tech support'
        )
      } finally {
        this.loading = false
      }
    },
    handleCloseNotes() {
      this.$emit('close-note-pad')
    },
    async getCategoryOptions() {
      await this.$store.dispatch('get_categoryOptions')
    },
    handleRemoveContractor(contractor) {
      const index = this.localOrder.contractors.indexOf(contractor)
      this.localOrder.contractors.splice(index, 1)
    },
    handleAssignOrders(contractors) {
      this.showSelectContractor = false
      contractors.forEach((contractor) => {
        this.localOrder.contractors.push(contractor)
      })
    },
    handleCancel() {
      this.initialize(this.order, true)
    },
    async initialize(order, initializeLocal) {
      try {
        this.loading = true
        const promises = []
        this.fohFile = null

        if (this.fohPreview === null) {
          this.fohPreview = order.fohImg
        }
        if (!this.categoryOptions.length) {
          const _categoryOptionsInStore = this.getCategoryOptions()
          promises.push(_categoryOptionsInStore)
        }
        if (!this.clientsList.length) {
          const _clientsListInStore = this.$store.dispatch('get_clientsList')
          promises.push(_clientsListInStore)
        }

        await Promise.all(promises)

        if (!this.local_needToSave || initializeLocal) {
          this.localOrder = {
            ...this.localOrder,
            ...order,
            assigned: order.contractors.length > 0,
            contractors: [...order.contractors],
          }
        } else {
          this.localOrder = {
            ...this.localOrder,
            inspections: order.inspections,
            allowables: order.allowables,
            allowablesPools: order.allowablesPools,
            workToDos: order.workToDos,
            tools: order.tools,
            appointments: order.appointments,
            instructions: order.instructions,
            assigned: this.localOrder.contractors.length > 0,
            contractors: [...this.localOrder.contractors],
            fohImg: order.fohImg,
          }
        }
      } catch (error) {
        this.$mainAlertError(`Error initializing component: ${error}`)
        // eslint-disable-next-line
        console.log('error initializing component', error)
      } finally {
        this.loading = false
      }
    },

    async handleDeleteFohPicture() {
      if (this.fohImgDelete === null) return
      await this.$store.dispatch('order/delete_foh_picture', {
        codeName: this.fohImgDelete.codeName,
        propertyId: this.localOrder.propertyId,
        url: this.fohImgDelete.url,
      })
      this.fohImgDelete = null
    },

    async handleSaveGaneralInfo() {
      if (!this.$refs.generalInfoForm.validate() || !this.local_needToSave) {
        return
      }

      try {
        this.loading = true

        if (this.fohFile) {
          await this.$store.dispatch('order/upload_foh_picture', {
            file: this.fohFile,
            propertyId: this.$getPropertyId(this.localOrder),
            orderId: this.localOrder.id,
          })
          this.fohFile = null
          // this.fohPreview = null
        }

        if (
          this._.isEqual(this.localOrder.contractors, this.order.contractors)
        ) {
          await this.$store.dispatch('orders/assign_orders', {
            orders: [this.localOrder],
            contractors: this.localOrder.contractors,
          })
        }

        let propertyId = this.localOrder.propertyId

        if (
          this.sameAddress ||
          this.sameCity ||
          this.sameCounty ||
          this.sameState ||
          this.sameZip
        ) {
          propertyId = this.$getPropertyId(this.localOrder)
        }

        const objectToSend = {
          propertyId,
          keyCode: this.localOrder.keyCode,
          vps: this.localOrder.vps,
          lockBox: this.localOrder.lockBox,
          category: this.localOrder.category,
          contractors: this.localOrder.contractors,
          contractorsUids: this.localOrder.contractors.map((c) => c.uid),
          assigned: this.localOrder.contractors.length > 0,
          estimatedCompleteDate: this.localOrder.estimatedCompleteDate || '',
          workType: this.localOrder.workType,
          address: this.localOrder.address,
          county: this.localOrder.county,
          city: this.localOrder.city,
          state: this.localOrder.state,
          zip: this.localOrder.zip,
          customer: this.localOrder.customer,
          loanType: this.localOrder.loanType,
          client: this.localOrder.client,
          fohImg: this.localOrder.fohImg,
        }
        await this.$store.dispatch('order/update_order', {
          orderId: this.localOrder.id,
          objectToSend,
        })
        this.loading = false
        this.handleDeleteFohPicture()
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleAddWinterization() {
      this.showAddWinterizationModal = true
    },
    handleAddTask(jobType) {
      let _jobType = jobType
      if (jobType.type === JOB_TYPES.allowables) {
        _jobType = { title: 'Allowables Pools', type: 'allowablesPools' }
      }

      this.jobTypeSelected = _jobType
      if (jobType.type !== JOB_TYPES.inspections) {
        this.addTaskModal = true
        return
      }
      this.addTaskInspections = true
    },
    async handleDeleteTask(task) {
      const { type } = task
      const orderId = this.localOrder.id
      this.loading = true
      try {
        await this.$store.dispatch('order/remove_jobTask', {
          orderId,
          jobTask: task,
          jobType: type,
        })
        this.loading = false
        this.$emit('close')
        this.$mainAlertSuccess(this.$t('taskDelete'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
    },
    handleCloseAddTask() {
      this.jobTaskToEdit = {}
      this.addTaskModal = false
    },
    handleCloseAddWinterization() {
      this.showAddWinterizationModal = false
    },
    handleCloseAddTaskInspection() {
      this.addTaskInspections = false
    },
    handleEditTask(task, jt) {
      this.jobTaskToEdit = {
        ...task,
        ...(task.pictures && { pictures: [...task.pictures] }),
      }
      this.jobTypeSelected = jt
      this.addTaskModal = true
    },
    handleDrop(e) {
      if (this.localOrder.edited) {
        return
      }
      // Handle files here
      const file = e.dataTransfer.items[0].getAsFile()
      this.$refs.dropzone.classList.remove('dragover')
      if (
        !file.type.includes('png') &&
        !file.type.includes('jpg') &&
        !file.type.includes('jpeg')
      ) {
        this.$mainAlertError(this.$t('soloArchivos'))
        return
      }
      this.processFile(file)
    },
    handleOptionalFile(e) {
      const file = e.target.files[0]
      this.processFile(file)
    },
    handleCloseFOH() {
      this.fohPreview = null
      this.fohImgDelete = this.localOrder.fohImg
      this.localOrder.fohImg = null
    },
    processFile(file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        this.fohPreview = {}
        this.fohPreview.url = event.target.result
      }
      reader.readAsDataURL(file)
      this.fohFile = file
    },
    handleDragOver() {
      if (this.localOrder.edited) {
        return
      }
      this.$refs.dropzone.classList.add('dragover')
    },
    handleDragLeave() {
      if (this.localOrder.edited) {
        return
      }
      this.$refs.dropzone.classList.remove('dragover')
    },
    handleDrag(e, jobTask, i, start) {
      const el = e.target

      if (start) {
        const objData = {
          jobTask,
          index: i,
        }
        e.dataTransfer.setData('text/plain', JSON.stringify(objData))
        el.classList.add('dragging')
      } else {
        el.classList.remove('dragging')
      }
    },
    handleDropTask(e) {
      const { jobTask } = JSON.parse(e.dataTransfer.getData('text/plain'))
      e.preventDefault()

      const taskToMoveId = jobTask.id
      const type = jobTask.type
      const afterElement = this.getDrafAfterElement(e.clientY, type)
      const afterElementId = afterElement?.id
      this.drop(taskToMoveId, afterElementId, type)
    },
    getDrafAfterElement(y, type = JOB_TYPES.workToDos) {
      const taskDivs =
        type === JOB_TYPES.allowablesPools
          ? this.$refs.tasksAp
          : this.$refs.tasks

      if (!taskDivs) {
        return null
      }
      return taskDivs.reduce(
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
    handleDragenter(e) {
      e.target.classList.add('dragover')
    },
    handleDragover(e) {
      e.preventDefault()
    },
    handleDragleave(e) {
      e.target.classList.remove('dragover')
    },
    drop(taskToMoveId, afterElementId, type) {
      if (taskToMoveId === afterElementId) {
        return
      }
      const _taskIdx = this.localOrder[type].findIndex(
        (t) => t.id === taskToMoveId
      )
      if (_taskIdx === -1) {
        return
      }
      const _task = this.localOrder[type][_taskIdx]
      const idxToInsert = this.localOrder[type].findIndex(
        (t) => t.id === afterElementId
      )

      if (idxToInsert === -1) {
        return
      }

      const _taskToInsert = this.localOrder[type][idxToInsert]
      this.localOrder[type].splice(_taskIdx, 1, _taskToInsert)
      this.localOrder[type].splice(idxToInsert, 1, _task)

      this.$nextTick(() => {
        this.setTasksPosition(this.localOrder[type])
      })
    },
    async setTasksPosition(tasks) {
      // tasks.forEach((t, i) => {
      //   if (t) {
      //     t.position = i + 1
      //   }
      // })

      try {
        await this.$store.dispatch('order/update_jobTasks', {
          orderId: this.order.id,
          tasks,
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.append-col {
  flex: 1 0 50%;
  max-width: 50%;

  padding: 12px;
}
.theme--dark {
  .foh-picture-box,
  .assignedTo-box {
    border: 1px solid rgba(255, 255, 255, 0.26);

    &.disabled {
      color: rgba(250, 250, 250, 0.38);
      border: 1px solid rgba(255, 255, 255, 0.2);
      .label {
        color: rgba(255, 255, 255, 0.38);
      }
      &:hover {
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    }

    &:hover {
      border: 1px solid #fff;
    }
  }
}

.foh-picture-box,
.assignedTo-box {
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 168px;
  padding: 12px;
  &.disabled {
    color: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(0, 0, 0, 0.26);

    .label {
      color: rgba(0, 0, 0, 0.38);
    }
    .no-preview {
      color: rgba(0, 0, 0, 0.38);

      .v-icon {
        color: rgba(0, 0, 0, 0.38);
      }
    }
    &:hover {
      border: 1px solid currentColor;
    }
  }
}
.foh-picture-box.dragover {
  background-color: var(--v-terciary-base);
}
.foh-picture-box {
  --max-height: 142px;
  .preview {
    width: 100%;
    height: 100%;
    max-height: var(--max-height);
    display: flex;
    align-items: center;
    position: relative;
    img {
      width: 100%;
      max-height: var(--max-height);
      object-fit: cover;
      display: block;
    }
    .closeBtn {
      display: none;
    }
    &:hover {
      .closeBtn {
        display: inline-flex;
      }
    }
  }
  .no-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  &.show-preview {
    .label {
      transform: translateY(-18px) scale(0.75);
    }
  }
  &:hover {
    border: 1px solid rgba(0, 0, 0, 0.86);
  }
}
.label {
  font-size: 0.8rem;
  position: absolute;
  top: 10px;
  transform-origin: left top;
  padding-inline: 2px;
  height: 20px;
  line-height: 20px;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  color: rgba(0, 0, 0, 0.6);
  background-color: #fff;
  &.dark {
    background-color: #1e1e1e;
    color: currentColor;
  }
}
.assignedTo-box {
  &.disabled {
    &:hover {
      border: 1px solid rgba(0, 0, 0, 0.26);
    }
    .contractors-item {
      &:hover {
        background-color: rgba(0, 0, 0, 0.38);
        .contractor-closeBtn {
          display: none;
        }
      }
    }
  }
  &.show-content {
    .label {
      transform: translateY(-18px) scale(0.75);
    }
  }
  &:hover {
    border: 1px solid rgba(0, 0, 0, 0.86);
  }
}
.contractors-list {
  padding: 0;
  list-style: none;
  max-height: 230px;
  overflow-y: auto;
  margin: 0;
}
::v-deep .contractors-list {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
::v-deep .contractors-list::-webkit-scrollbar {
  display: none; /* Chrome */
}
.contractors-item {
  font-size: 14px;
  .contractor-closeBtn {
    display: none;
  }
  &:hover {
    background-color: var(--v-terciary-base);
    .contractor-closeBtn {
      display: inline-block;
    }
  }
}
.option-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.38);
}
.pointer {
  cursor: pointer;
}
.closeBtn {
  position: absolute;
  top: 0px;
  right: 0px;
}

.grow-enter-active,
.grow-leave-active {
  transition: all 500ms cubic-bezier(0.075, 0.82, 0.165, 1);
}
.grow-enter, .grow-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translate(-100px, 100px);
}
</style>
