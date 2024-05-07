<template>
  <div v-if="started" class="perfromance-section | info--text gap-10">
    <div>
      <v-tooltip
        v-if="finished && finishedBy"
        open-delay="600"
        content-class="small"
        top
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <div
            class="d-flex align-center gap-2"
            v-bind="attrs"
            v-on="on"
            @click="handleUserInfo(finishedBy)"
          >
            <v-icon size="12" color="primary"
              >mdi-account-hard-hat-outline</v-icon
            >
            <span>{{ finishedBy.fullName }}</span>
          </div>
        </template>
        <span>{{ $truncate(title, 20) }} - {{ $t('approvedBy') }}</span>
      </v-tooltip>

      <!-- <v-menu
        v-if="finished && finishedBy"
        v-model="showUserInfoFinished"
        bottom
        offset-y
        :nudge-width="500"
        :close-on-content-click="false"
        max-width="400"
        min-width="400"
        open-delay="600"
        :open-on-click="isAdmin"
        :open-on-hover="isAdmin"
      >
       
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>
           
            <template v-slot:activator="{ on: tooltip }">
              <div
                class="container-user | d-flex align-center gap-2"
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon size="12" color="primary"
                  >mdi-account-hard-hat-outline</v-icon
                >
                <span>{{ finishedBy.fullName }}</span>
              </div>
            </template>
            <span>{{ $truncate(title, 20) }} - {{ $t('approvedBy') }}</span>
          </v-tooltip>
        </template>

        <user-info
          v-if="showUserInfoFinished"
          :user-uid="finishedBy.uid"
        ></user-info>
      </v-menu> -->
    </div>
    <div>
      <v-tooltip v-if="startedBy" open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <div class="d-flex align-center gap-2" v-bind="attrs" v-on="on">
            <v-icon size="12" color="green"
              >mdi-account-hard-hat-outline</v-icon
            >
            <span>{{ startedBy.fullName }}</span>
          </div>
        </template>
        <span>{{ $truncate(title, 20) }} - {{ $t('startedBy') }}</span>
      </v-tooltip>
      <!-- <v-menu
        v-if="startedBy"
        v-model="showUserInfoStarted"
        bottom
        offset-y
        :nudge-width="500"
        :close-on-content-click="false"
        max-width="400"
        min-width="400"
        open-delay="600"
        :open-on-click="isAdmin"
        :open-on-hover="isAdmin"
      >
        
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>
            <template v-slot:activator="{ on: tooltip }">
              <div
                class="container-user | d-flex align-center gap-2"
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
              >
                <v-icon size="12" color="green"
                  >mdi-account-hard-hat-outline</v-icon
                >
                <span>{{ startedBy.fullName }}</span>
              </div>
            </template>
            <span>{{ $truncate(title, 20) }} - {{ $t('startedBy') }}</span>
          </v-tooltip>
        </template>
        <user-info
          v-if="showUserInfoStarted"
          :user-uid="startedBy.uid"
        ></user-info>
      </v-menu> -->
    </div>
    <div>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <div class="d-flex align-center" v-bind="attrs" v-on="on">
            <v-icon size="12" color="success" class="ml-1 mr-1"
              >mdi-clock-outline</v-icon
            >

            <span v-show="started && !finished">
              {{ elapsetTimeOnTask }}
            </span>
            <span v-show="finished && startedAt">
              {{ timeOnTaks }}
            </span>
          </div>
        </template>
        <span>Time on: {{ $truncate(title, 20) }}</span>
      </v-tooltip>
    </div>
    <div
      v-if="
        finished && finishedBy && user.profile.uid === finishedBy.uid && fromOos
      "
    >
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            x-small
            :class="['rate-btn mr-1', { 'no-rated': !rating }]"
            v-bind="attrs"
            v-on="on"
            @click="handleShowRatingModal()"
          >
            <v-icon small color="yellow">{{
              rating ? 'mdi-star' : 'mdi-star-outline'
            }}</v-icon>
          </v-btn>
        </template>

        <span v-show="!rating">Please Rate {{ startedBy.name }}'s work</span>
        <span v-show="rating">{{ startedBy.name }}'s work rate</span>
      </v-tooltip>
    </div>

    <v-dialog
      v-model="showRatingModal"
      max-width="500px"
      transition="dialog-transition"
    >
      <RatingModal
        v-if="showRatingModal"
        :contractor="startedBy"
        :order-id="orderId"
        :task-id="taskId"
        :req-id="reqId"
        :task-type="taskType"
        :process-time="processTime"
        :rating="rating"
        @close="showRatingModal = false"
      />
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RatingModal from './modals/RatingModal.vue'
import { ROL_TYPES } from '@/utils/dictionaries'
export default {
  name: 'PerformaceSection',
  components: { RatingModal },
  props: {
    taskType: { type: String, required: true },
    processTime: { type: String, required: true },
    orderId: { type: String, required: true },
    taskId: { type: String, required: true },
    reqId: { type: String, required: true },
    title: { type: String, default: '' },
    started: { type: Boolean, default: false },
    finished: { type: Boolean, default: false },
    startedAt: { type: Object, default: () => ({}) },
    startedBy: { type: Object, default: () => ({}) },
    finishedBy: { type: Object, default: () => ({}) },
    finishedAt: { type: Object, default: () => ({}) },
    fromOos: { type: Boolean, default: false },
  },
  data() {
    return {
      elapsetTimeOnTask: '0:00:00',
      elapsetTimeOnTaskInterval: null,
      showRatingModal: false,
      showUserInfoStarted: null,
      showUserInfoFinished: null,
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
    rating() {
      return this.$store.getters['ratings/get_rating']({
        taskType: this.taskType,
        processTime: this.processTime,
        orderId: this.orderId,
        taskId: this.taskId,
        reqId: this.reqId,
      })
    },

    timeOnTaks() {
      let res = '0:00:00'

      if (this.startedAt?.seconds && this.finishedAt?.seconds) {
        const initTime = this.startedAt.seconds
        const finishTime = this.finishedAt.seconds
        const _elapsetTimeOnTask = Math.floor(finishTime - initTime)

        const sec = (_elapsetTimeOnTask % 60).toString().padStart(2, '0')
        const min = (Math.floor(_elapsetTimeOnTask / 60) % 60)
          .toString()
          .padStart(2, '0')
        const hour = Math.floor(_elapsetTimeOnTask / 60 / 60).toString()
        res = `${hour}:${min}:${sec}`
      }

      return res
    },
    isAdmin() {
      const _claims = this.user.userCredential.claims
      return _claims.rol === ROL_TYPES.admin && _claims.authLevel > 6
    },
  },
  watch: {
    started(newVal, oldVal) {
      this.setElapsetTimeOnTaskInterval()
    },
    finished(newVal, oldVal) {
      this.setElapsetTimeOnTaskInterval()
      if (newVal) {
        this.getRating()
      }
    },
  },
  mounted() {
    if (this.started && !this.finished) {
      this.setElapsetTimeOnTaskInterval()
    }

    if (this.finished) {
      this.getRating()
    }
  },
  beforeDestroy() {
    clearInterval(this.elapsetTimeOnTaskInterval)
  },
  methods: {
    getRating() {
      this.$store.dispatch('ratings/get_rating', {
        contractorUid: this.startedBy.uid,
        orderId: this.orderId,
        taskId: this.taskId,
        processTime: this.processTime,
        reqId: this.reqId,
        taskType: this.taskType,
      })
    },
    setElapsetTimeOnTaskInterval() {
      this.elapsetTimeOnTaskInterval = setInterval(() => {
        if (this.finished) {
          clearInterval(this.elapsetTimeOnTaskInterval)
        }
        if (!this.startedAt) {
          return
        }

        const initTime = this.startedAt.seconds * 1000
        const now = new Date().getTime()
        const _elapsetTimeOnTask = Math.floor((now - initTime) / 1000)
        const sec = (_elapsetTimeOnTask % 60).toString().padStart(2, '0')
        const min = (Math.floor(_elapsetTimeOnTask / 60) % 60)
          .toString()
          .padStart(2, '0')
        const hour = Math.floor(_elapsetTimeOnTask / 60 / 60).toString()

        this.elapsetTimeOnTask = `${hour}:${min}:${sec}`
      }, 1000)
    },
    handleShowRatingModal() {
      if (this.user.profile.uid !== this.finishedBy.uid) {
        this.$mainAlertInfo('Only those who passed this section can qualify')
        return
      }
      this.showRatingModal = !this.showRatingModal
    },
  },
}
</script>

<style lang="scss" scoped>
.perfromance-section {
  min-height: 18px;
  font-size: 0.7rem;
  display: grid;
  grid-template-columns: repeat(4, auto);
  justify-content: end;
}

.no-rated {
  animation: beat 1000ms infinite;
}

@keyframes beat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
}
.container-user {
  cursor: pointer;
}
</style>
