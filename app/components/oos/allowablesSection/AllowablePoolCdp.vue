<template>
  <div class="allowable-pool | d-flex align-center gap-12">
    <div class="d-flex flex-column ml-2">
      <h2 class="ma-0 task-title">{{ allowablePool.title }}</h2>

      <span v-if="allowablePool.maxValue" class="max-value | info--text">
        {{ $t('maxValue') }}: ${{ allowablePool.maxValue }}</span
      >
    </div>

    <!-- <span v-if="allowablePool.maxValue">
      {{ $t('maxValue') }}: ${{ allowablePool.maxValue }}
    </span> -->
    <v-spacer></v-spacer>
    <v-btn
      v-if="allowablePool.approved"
      class="elevation-0"
      color="primary"
      small
      :loading="loadingReqs"
      @click="handleCreateNewTask"
      >{{ $t('createNewTask') }}</v-btn
    >
    <v-btn
      class="elevation-0 white--text"
      color="background_select"
      small
      @click="showApprovalConfirmationModal = true"
      >{{ allowablePool.approved ? $t('close') : $t('open') }}</v-btn
    >

    <v-dialog v-model="showApprovalConfirmationModal" max-width="600">
      <v-card class="elevation-0">
        <v-toolbar color="secondary" dense>
          <v-toolbar-title class="d-flex aling-center">
            <v-icon color="yellow darken-2" class="mr-4">mdi-alert</v-icon>
            <span class="ma-0 text-h5 white--text">{{
              $t('alertTitle')
            }}</span></v-toolbar-title
          >
        </v-toolbar>

        <v-card-text class="pa-4">
          <p class="text-body-1">
            {{ $t('Plase confirm that you want to approve this allowable') }}
          </p>
          <p class="text-h6">{{ allowablePool.title }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            outlined
            :disabled="loading"
            @click="showApprovalConfirmationModal = false"
            >{{ $t('cancel') }}</v-btn
          >
          <v-btn color="primary" :loading="loading" @click="handleApprove"
            >Ok</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="addTaskModal"
      :persistent="validatePersistent"
      scrollable
      max-width="1000px"
    >
      <add-task
        v-if="addTaskModal"
        :order="order"
        :job-type="{ title: 'allowables', type: 'allowables' }"
        :allowable-to-add="allowableToAdd"
        :max-value="maxValue"
        @update-persistent="validatePersistent = $event"
        @close="handleCloseAddTask"
      />
    </v-dialog>
  </div>
</template>

<script>
import AddTask from '@/components/orders/task/AddTask.vue'
import { JOB_TYPES } from '~/utils/dictionaries'

export default {
  name: 'AllowablePoolCdp',
  components: {
    AddTask,
  },
  props: {
    allowablePool: { type: Object, default: () => ({}) },
    order: { type: Object, default: () => ({}) },
    maxValue: { type: Number, default: Number.POSITIVE_INFINITY },
  },
  data() {
    return {
      loading: false,
      showApprovalConfirmationModal: false,
      addTaskModal: false,
      validatePersistent: false,
      allowableToAdd: {},
      loadingReqs: false,
    }
  },
  computed: {
    newTask() {
      return 'Add Task'
    },
    dummyTask() {
      return this.$store.state.order.dummyTasks.allowables
    },
    tasksLastPosition() {
      const _tasks = this.order.allowables
      if (!_tasks || !_tasks.length) {
        return 1
      }
      return _tasks[_tasks.length - 1].position + 1
    },
  },
  methods: {
    handleCloseAddTask() {
      this.jobTaskToEdit = {}
      this.addTaskModal = false
    },
    async handleApprove() {
      try {
        this.loading = true

        const _approve = Object.prototype.hasOwnProperty.call(
          this.allowablePool,
          'approved'
        )
          ? !this.allowablePool.approved
          : true

        await this.$store.dispatch('oos/orders/set_allowablePoolApproved', {
          orderId: this.order.id,
          allowablePoolId: this.allowablePool.id,
          approved: _approve,
        })

        this.showApprovalConfirmationModal = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
      } finally {
        this.loading = false
      }
    },
    async handleCreateNewTask() {
      if (!this.allowablePool.itemsForInvoices.length) {
        this.$mainAlertInfo(
          'You need to edit what is allowed and add items for invoices, it is necessary to be able to create tasks'
        )
        return
      }

      let requirements = []

      try {
        this.loadingReqs = true

        requirements = await this.$store.dispatch(
          'oos/orders/get_requirementsForTask',

          {
            orderId: this.order.id,
            taskId: this.allowablePool.id,
            type: JOB_TYPES.allowablesPools,
          }
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error getting requirements', error)
      } finally {
        this.loadingReqs = false
      }

      if (!requirements) {
        this.$mainAlertInfo(
          'There was an error getting the requirements for this task, please try later, if problem persists contact support'
        )
        return
      }
      if (!requirements.length) {
        this.$mainAlertInfo(
          'There are no requirements for this task, please edit this allowable pool and add requirements to be able to create tasks'
        )
        return
      }

      this.allowableToAdd = {
        ...this.dummyTask,
        desc: this.allowablePool.desc,
        itemsForInvoices: this.allowablePool.itemsForInvoices.map((item) => ({
          ...item,
          qty: item.qty,
        })),
        needProcessTimes: this.allowablePool.needProcessTimes,
        poolId: this.allowablePool.id,
        pictures: this.allowablePool.pictures,
        quantityPhotosRequiredForAfter:
          this.allowablePool.quantityPhotosRequiredForAfter,
        quantityPhotosRequiredForBefore:
          this.allowablePool.quantityPhotosRequiredForBefore,
        quantityPhotosRequiredForDuring:
          this.allowablePool.quantityPhotosRequiredForDuring,
        quantityPhotosRequiredForGeneral:
          this.allowablePool.quantityPhotosRequiredForGeneral,
        requirements,
        title: this.allowablePool.title,
        id: this.$generateId(),
        position: this.tasksLastPosition,
      }

      this.addTaskModal = true
    },
  },
}
</script>

<style lang="scss" scoped>
.allowable-pool {
  background-color: var(--v-terciary-base);
  padding: 0.5rem;
  border-radius: 0.25rem;
}
.task-title {
  font-size: 1.125rem;
  font-weight: bold;
}
.max-value {
  font-size: 0.8rem;
  font-weight: bold;
}
</style>
