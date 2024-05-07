<template>
  <v-dialog
    v-model="show"
    persistent
    max-width="500px"
    transition="dialog-transition"
  >
    <v-stepper v-model="number">
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card-title primary-title> {{ $t('orderNumber') }} </v-card-title>
          <v-card-text>
            <p>
              {{
                $t(
                  'Enter the order number to which this resource will be copy.'
                )
              }}
            </p>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="numberOrder"
                    label="WO#"
                    outlined
                    autofocus
                    dense
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              class="mr-4 mb-2"
              color="error"
              outlined
              @click="$emit('close')"
              >{{ $t('cancel') }}</v-btn
            >
            <v-btn
              color="primary"
              class="mb-2"
              :loading="loading"
              :disabled="numberOrder === ''"
              @click="handleNumberOrder()"
              >{{ $t('continue') }}</v-btn
            >
          </v-card-actions>
        </v-stepper-content>

        <v-stepper-content step="2">
          <!-- <v-card > -->
          <v-card-title primary-title> {{ $t('selectTask') }} </v-card-title>
          <v-card-text>
            <p>
              {{ $t('Select the task to which this resource will be copy.') }}
            </p>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-combobox
                    v-if="order && order.tasks"
                    v-model="taskItemSelected"
                    :items="itemsTask"
                    outlined
                    dense
                    :label="$t('tasks')"
                    clearable
                    hide-details="auto"
                    required
                  ></v-combobox>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              class="mr-4 mb-2"
              color="error"
              outlined
              @click="number = 1"
              >{{ $t('back') }}</v-btn
            >
            <v-btn
              color="primary"
              class="mb-2"
              :loading="loading"
              @click="handleTaskSection()"
              >{{ $t('continue') }}</v-btn
            >
          </v-card-actions>
          <!-- </v-card> -->
        </v-stepper-content>

        <v-stepper-content step="3">
          <!-- <v-card> -->
          <v-card-title primary-title> {{ $t('sections') }} </v-card-title>
          <v-card-text>
            <p>
              {{ $t('Enter the section to which this resource will be copy.') }}
            </p>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-combobox
                    v-if="itemsSeccion && itemsSeccion.length"
                    v-model="seccionItemSelected"
                    :items="itemsSeccion"
                    outlined
                    dense
                    :label="$t('sections')"
                    clearable
                    hide-details="auto"
                    required
                  ></v-combobox>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              class="mr-4 mb-2"
              color="error"
              outlined
              @click="number = 2"
              >{{ $t('back') }}</v-btn
            >
            <v-btn
              color="primary"
              :loading="loading"
              class="mb-2"
              @click="handleCopy()"
            >
              {{ isCopy ? $t('copy') : isMove ? $t('move') : $t('save') }}
            </v-btn>
          </v-card-actions>
          <!-- </v-card> -->
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-dialog>
</template>

<script>
import { httpsCallable } from '@firebase/functions'
import { serverTimestamp } from '@firebase/firestore'
import { functions } from '../../../../plugins/firebase'
import { PROCESS_TIME_TYPES, JOB_TYPES } from '@/utils/dictionaries'

export default {
  name: 'ModalForReportsActions',
  props: {
    showModal: { type: Boolean, default: false },
    reportsSelected: { type: Array, default: () => [] },
    isCopy: { type: Boolean, default: false },
    isMove: { type: Boolean, default: false },
  },
  data() {
    return {
      show: false,
      number: 1,
      numberOrder: '',
      order: {},
      taskItemSelected: null,
      seccionItemSelected: null,
      seccionItemSelectedRequirement: null,
      itemsSeccionRequirements: [],
      requirements: [],
      taskSelected: {},
      requirementSelected: null,
      seccionSelected: {},
      fromRequirement: false,
      before: false,
      during: false,
      after: false,
      loading: false,
      area: '',
      sections: [],
      PROCESS_TIME_TYPES: null,
      JOB_TYPES: null,
    }
  },
  computed: {
    _show() {
      return this.showModal
    },
    itemsTask() {
      return this.order.tasks.tasks.map((task) => {
        return {
          text: `${task.type.charAt(0).toUpperCase() + task.type.slice(1)}: ${
            task.title
          }`,
          value: task.id,
        }
      })
    },
    itemsSeccion() {
      return this.sections
    },
    user() {
      return this.$store.state.auth.user.profile
    },
  },
  watch: {
    _show(val) {
      this.show = val
    },
  },
  created() {
    this.PROCESS_TIME_TYPES = PROCESS_TIME_TYPES
    this.JOB_TYPES = JOB_TYPES
  },
  mounted() {
    this.show = this.showModal
  },
  methods: {
    getSections() {
      this.sections = []
      if (!this.taskSelected) {
        return
      }

      const reportSelectedAux = this.reportsSelected[0]
      const taskId = reportSelectedAux.task.id
      const requirementId = reportSelectedAux.requirementId
      const isNotSameTask = taskId !== this.taskSelected.id

      const convertToSectionOption = (options) => {
        const _options = []
        options.forEach((option) => {
          _options.push({
            text: option.charAt(0).toUpperCase() + option.slice(1),
            value: option,
          })
        })
        return _options
      }

      const addToSections = (sectionOptions, isPush) => {
        sectionOptions.forEach((option) => {
          isPush ? this.sections.push(option) : this.sections.unshift(option)
        })
      }

      // Areas
      const addAreas = (areas, checkDiff, areaToCheck) => {
        for (let i = 0; i < areas.length; i++) {
          const area = areas[i]
          const option = {
            text: area.text,
            value: area.id,
          }
          if (!checkDiff) {
            addToSections([option], false)
            continue
          }

          if (areaToCheck !== area.text) {
            addToSections([option], false)
          }
        }
      }

      if (
        this.taskSelected.type === JOB_TYPES.inspections &&
        this.order.tasks &&
        this.order.tasks.areas?.length
      ) {
        const areas = this.taskSelected.areasInReports

        const areasOptions = convertToSectionOption(areas)

        addAreas(areasOptions, !isNotSameTask, reportSelectedAux.area)
        // addAreas(this.order.tasks.areas, !isNotSameTask, reportSelectedAux.area)
      }

      // if (this.taskSelected.needProcessTimes && !isNotSameTask) {
      //   const options = ['before', 'after', 'during']

      //   const finalOptions = options.filter((o) => {
      //     if (requirementId !== 'NoReqId') {
      //       return o
      //     }
      //     return !reportSelectedAux[o]
      //   })

      //   addToSections(convertToSectionOption(finalOptions), false)
      // }

      /* Requirements */

      const reqsFromBefore = this.requirements.filter((req) => req.fromBefore)
      const reqsFromDuring = this.requirements.filter((req) => req.fromDuring)
      const reqsFromAfter = this.requirements.filter((req) => req.fromAfter)
      const reqsFromGeneral = this.requirements.filter((req) => req.fromGeneral)

      if (reqsFromBefore.length) {
        reqsFromBefore.forEach((req) => {
          if (req.id !== requirementId) {
            const option = {
              text: `Before: ${req.descRequirement}`,
              value: req,
            }
            addToSections([option], true)
          }
        })
      }

      if (reqsFromDuring.length) {
        reqsFromDuring.forEach((req) => {
          if (req.id !== requirementId) {
            const option = {
              text: `During: ${req.descRequirement}`,
              value: req,
            }
            addToSections([option], true)
          }
        })
      }
      if (reqsFromAfter.length) {
        reqsFromAfter.forEach((req) => {
          if (req.id !== requirementId) {
            const option = {
              text: `After: ${req.descRequirement}`,
              value: req,
            }
            addToSections([option], true)
          }
        })
      }
      if (reqsFromGeneral.length) {
        reqsFromGeneral.forEach((req) => {
          if (req.id !== requirementId) {
            const option = {
              text: `General: ${req.descRequirement}`,
              value: req,
            }
            addToSections([option], true)
          }
        })
      }

      // if (this.taskSelected.needProcessTimes && isNotSameTask) {
      //   addToSections(
      //     convertToSectionOption(['before', 'during', 'after']),
      //     false
      //   )
      // }

      //

      // if (
      //   !this.taskSelected.needProcessTimes &&
      //   this.taskSelected.type !== JOB_TYPES.inspections &&
      //   reportSelectedAux.fromRequirement
      // ) {
      //   addToSections(convertToSectionOption(['reports']), true)
      //   return
      // }
      // if (
      //   !this.taskSelected.needProcessTimes &&
      //   this.taskSelected.type !== JOB_TYPES.inspections &&
      //   isNotSameTask
      // ) {
      //   addToSections(convertToSectionOption(['reports']), true)
      // }

      //
    },
    async handleNumberOrder() {
      this.loading = true

      try {
        this.order = await this.$store.dispatch(
          'oos/orders/get_ordersByReportsActions',
          {
            numberOrder: this.numberOrder,
          }
        )
        this.number = 2
      } catch (error) {
        // eslint-disable-next-line
        console.log('error feching order: ', error)
        this.$mainAlertError(this.$t('oopsProblemOrder'))
      } finally {
        this.loading = false
      }
    },

    async handleTaskSection() {
      this.loading = true
      const indexOfTask = this.order.tasks.tasks
        .map((t) => t.id)
        .indexOf(this.taskItemSelected.value)

      this.taskSelected = this.order.tasks.tasks[indexOfTask]

      try {
        this.requirements = await this.$store.dispatch(
          'oos/orders/get_requirementsForTask',
          {
            orderId: this.order.id,
            taskId: this.taskSelected.id,
            type: this.taskSelected.type,
          }
        )
        this.number = 3
        this.getSections()
      } catch (error) {
        // eslint-disable-next-line
        console.log('error feching order: ', error)
        this.$mainAlertError(this.$t('oopsProblemOrder'))
      } finally {
        this.loading = false
      }
    },
    handleSelectedSection() {
      // const sectionSelected = this.seccionItemSelected.value
    },
    handleSection() {
      const indexOfRequirement = this.requirements
        .map((t) => t.descRequirement)
        .indexOf(this.seccionItemSelected.text)

      this.requirementSelected =
        indexOfRequirement > -1 ? this.requirements[indexOfRequirement] : null
      this.fromRequirement = !!this.requirementSelected

      this.before = this.seccionItemSelected.text === PROCESS_TIME_TYPES.before
      this.after = this.seccionItemSelected.text === PROCESS_TIME_TYPES.after
      this.during = this.seccionItemSelected.text === PROCESS_TIME_TYPES.during

      if (this.taskSelected.type === JOB_TYPES.inspections) {
        this.area =
          indexOfRequirement > -1
            ? this.requirements[indexOfRequirement].inspectionArea
            : this.seccionItemSelected.text
      }
    },
    async handleCopy() {
      this.handleSection()
      this.loading = true
      // const reportsForDb = []
      const reportsForStorage = []

      for (let i = 0; i < this.reportsSelected.length; i++) {
        const report = this.reportsSelected[i]
        const codeName =
          '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
        const oldPath = `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports/${report.codeName}`

        const newReport = {
          after: this.seccionItemSelected.value?.after || false,
          before: this.seccionItemSelected.value?.before || false,
          during: this.seccionItemSelected.value?.during || false,
          codeName,
          area:
            this.taskSelected.type === JOB_TYPES.inspections
              ? this.seccionItemSelected.text
              : '',
          createdBy: this.user,
          filePath: null,
          filePathPreview: null,
          fromRequirement: this.taskSelected.type !== JOB_TYPES.inspections,
          geoLoc: report.geoLoc,
          id: codeName,
          mediaType: 'image',
          orderId: this.order.id,
          requirementId:
            this.taskSelected.type !== JOB_TYPES.inspections
              ? this.seccionItemSelected.value?.id
              : 'NoReqId',
          task: {
            id: this.taskSelected.id,
            type: this.taskSelected.type,
          },
        }

        reportsForStorage.push({
          codeName: report.codeName,
          path: oldPath,
          destination: {
            orderId: this.order.id,
            taskType: this.taskSelected.type,
            taskId: this.taskSelected.id,
            newCodeName: codeName,
          },
          reportInfo: JSON.stringify(newReport),
        })
        // reportsForDb.push({
        //   newCodeName: codeName,
        //   report,
        // })
      }

      try {
        const copyMoveReports = httpsCallable(functions, 'copyMoveReports')
        await copyMoveReports({
          reports: reportsForStorage,
          isCopy: this.isCopy,
          isMove: this.isMove,
        })
        // this.addReports(reportsForDb)
        this.loading = true
        this.$emit('close')
        this.$emit('uncheck-reports')
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    async addReports(reportsForDb) {
      const newReportsList = []

      for (let i = 0; i < reportsForDb.length; i++) {
        const { report, newCodeName } = reportsForDb[i]
        const newReport = {
          after: this.after,
          before: this.before,
          during: this.during,
          codeName: newCodeName,
          area: this.area,
          createdAt: serverTimestamp(),
          createdBy: this.user,
          filePath: null,
          filePathPreview: null,
          fromRequirement: this.fromRequirement,
          geoLoc: report.geoLoc,
          id: newCodeName,
          mediaType: 'image',
          orderId: this.order.id,
          requirementId: this.requirementSelected
            ? this.requirementSelected.id
            : 'NoReqId',
          task: {
            id: this.taskSelected.id,
            type: this.taskSelected.type,
          },
        }
        newReportsList.push(newReport)
      }

      try {
        await this.$store.dispatch('oos/orders/copy_reports', newReportsList)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
