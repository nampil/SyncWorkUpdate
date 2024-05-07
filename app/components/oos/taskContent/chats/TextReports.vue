<!-- TODO: Eliminar si no se usa -->
<template>
  <div
    :id="`chat-${report.id}`"
    ref="chat"
    class="content-text-reports"
    :class="[
      {
        'is-author': isAuthor,
      },
      {
        hightlight: hightlightTaskChat === report.id,
      },
    ]"
  >
    <div v-if="isUnreadByUser" class="no-read-indicator"></div>
    <div
      v-if="
        report.attachmentFile &&
        Object.entries(report.attachmentFile).length !== 0
      "
      class="attachment mb-2"
    >
      <div
        v-if="report.attachmentFile.type.includes('audio')"
        class="d-flex container-audio"
      >
        <v-btn icon small @click="handleAudio(report.attachmentFile.url)">
          <v-icon large color="primary">{{
            !showAudio ? 'mdi-play' : 'mdi-pause'
          }}</v-icon>
        </v-btn>

        <div
          v-if="duration !== null"
          class="duration | info--text d-flex align-center ml-3"
        >
          <span>{{ duration }}</span>
        </div>
      </div>
    </div>

    <div v-if="report.text !== ''">
      <p
        v-for="(_msg, index) in report.text.split('\n')"
        :key="index"
        class="report-text"
      >
        {{ _msg }}
      </p>
    </div>
    <p v-if="report.createdBy" class="report-metadata">
      {{ report.createdBy.fullName }} -
      {{ $formatDate(report.createdAt.toDate(), { time: true }) }}
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'TestReports',
  props: {
    report: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      showAudio: false,
      duration: null,
      observer: null,
      isVisible: false,
      timer: null,
    }
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      hightlightTaskChat: (state) => state.oos.orders.hightlightTaskChat,
    }),
    isAuthor() {
      return (
        this.report.createdBy &&
        this.user.profile.uid === this.report.createdBy.uid
      )
    },
    isUnreadByUser() {
      return (
        !this.isAuthor && !this.report.readBy?.includes(this.user.profile.uid)
      )
    },
    needObserver() {
      return (!this.report.read || this.isUnreadByUser) && !this.isAuthor
    },
  },
  watch: {
    needObserver: {
      handler(val) {
        if (val) {
          this.handleReadObserver()
        } else {
          this.disconnectObserver()
        }
      },
      // immediate: true,
    },
  },
  mounted() {
    if (
      this.report.attachmentFile &&
      this.report.attachmentFile.type &&
      this.report.attachmentFile.type.includes('audio')
    ) {
      const audioDuration = new Audio(this.report.attachmentFile.url)
      audioDuration.onloadedmetadata = () =>
        this.setDurationAudio(audioDuration.duration)
    }
    this.$nextTick(() => {
      this.handleReadObserver()
    })
  },
  methods: {
    disconnectObserver() {
      if (!this.observer) return
      this.observer.disconnect()
    },
    handleReadObserver() {
      if (!this.needObserver) return
      this.disconnectObserver()
      const root = document.querySelector('#scroll-zone')

      if (!root) return

      this.$nextTick(() => {
        const $chat = this.$refs.chat

        if (!$chat) return
        const options = {
          root,
          rootMargin: '0px',
          threshold: 1.0,
        }

        this.observer = new self.IntersectionObserver(this.cbObserver, options)
        this.$nextTick(() => {
          this.observer.observe($chat)
        })
      })
    },
    cbObserver(entries) {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting
        const { boundingClientRect, rootBounds } = entry
        const { top: targetTop, bottom: targetBootom } = boundingClientRect
        const { bottom: scrollZoneBottom, top: scrollZoneTop } = rootBounds

        if (entry.isIntersecting) {
          this.$emit('is-below', { below: false, chatId: this.report.id })
          this.$emit('is-over', { over: false, chatId: this.report.id })

          this.timer = setTimeout(async () => {
            if (this.isVisible) {
              try {
                const { id: taskChatId, orderId, task } = this.report
                const objectToUpdate = {
                  read: true,
                  readBy: this.user.profile.uid,
                }

                await this.$store.dispatch('oos/orders/update_taskChat', {
                  taskChatId,
                  orderId,
                  type: task.type,
                  taskId: task.taskId,
                  objectToUpdate,
                })
                this.disconnectObserver()
              } catch (error) {
                // eslint-disable-next-line
                console.log('error setting read textReport', error)
              }
            }
          }, 1000)
        } else {
          if (targetBootom > scrollZoneBottom) {
            this.$emit('is-below', { below: true, chatId: this.report.id })
          } else {
            this.$emit('is-below', { below: false, chatId: this.report.id })
          }
          if (targetTop < scrollZoneTop) {
            this.$emit('is-over', { over: true, chatId: this.report.id })
          } else {
            this.$emit('is-over', { over: false, chatId: this.report.id })
          }

          // clearTimeout(this.timer)
        }
      })
    },
    setDurationAudio(time) {
      const sec = parseInt(time % 60)
        .toString()
        .padStart(2, '0')
      const min = (Math.floor(time / 60) % 60).toString().padStart(2, '0')
      this.duration = `${min}:${sec}`
    },
    loopAudio(time) {
      this.timeAudioInterval = setInterval(() => {
        this.setDurationAudio(
          parseInt(time) - parseInt(this.audio.currentTime.toFixed())
        )

        if (this.audio.paused) {
          this.setDurationAudio(this.audio.duration)
          clearInterval(this.timeAudioInterval)
        }
        if (this.audio.ended) {
          this.setDurationAudio(this.audio.duration)
          clearInterval(this.timeAudioInterval)
          this.showAudio = false
        }
      }, 1000)
    },
    handleAudio(url) {
      if (!this.showAudio) {
        this.audio = new Audio(url)
        this.audio.play()
        this.audio.preload = 'metadata'
        this.audio.onloadedmetadata = () => this.loopAudio(this.audio.duration)
      } else {
        this.audio.pause()
      }

      this.showAudio = !this.showAudio
    },
  },
}
</script>

<style lang="scss" scoped>
.content-text-reports {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 8px;
  margin-bottom: 0.5rem;
  border-radius: 5px;
  background-color: var(--clr-neutral-200);
  transition: background-color 300ms ease-in-out;
  &.is-author {
    background-color: var(--v-terciary-base);
  }
}
.no-read-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  aspect-ratio: 1;
  background-color: var(--v-error-base);
  border-radius: 4px;
}
.theme--dark {
  .content-text-reports {
    background-color: var(--v-terciary-base);

    &.is-author {
      background-color: var(--v-secondary-base);
    }
    &.hightlight {
      background-color: var(--v-warning-darken4);
    }
  }
}

.report-text {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}
.report-metadata {
  // grid-row: 2/3;
  text-align: right;
  font-size: 0.75rem;
  color: var(--v-info-base);
  // font-weight: bold;
  margin: 0;
}
</style>
