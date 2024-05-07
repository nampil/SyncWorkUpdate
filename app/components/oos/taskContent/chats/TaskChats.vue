<!-- TODO: Eliminar este archivo -->
<template>
  <v-slide-x-reverse-transition>
    <div
      v-show="showTaskChats"
      :class="['chats elevation-1 flex-column', { 'd-flex': showTaskChats }]"
      class="chat-container"
    >
      <v-toolbar color="secondary" dark dense class="flex-grow-0">
        <h4 v-if="task" class="text--bold text-truncate">{{ task.title }}</h4>
        <v-spacer></v-spacer>

        <v-btn class="mr-1" icon small @click="handleTaskChats(false)">
          <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>
      </v-toolbar>
      <div id="scroll-zone" ref="chatZone" class="flex-grow-1 chat-zone">
        <div v-if="unreadOver.length" class="unread-chats-indicator over">
          {{ unreadOver.length }}
        </div>
        <!-- v-if="
            task &&
            task.taskChats &&
            taskchatFormatted &&
            taskchatFormatted.length
          " -->
        <div class="reports-group ma-2">
          <div v-for="report in taskchatFormatted" :key="report.id">
            <text-reports
              :report="report"
              @is-below="handleUnreadBelow"
              @is-over="handleUnreadOver"
            ></text-reports>
          </div>
        </div>

        <!-- <div v-else class="no-reports-text d-flex justify-center mt-4">
          {{ $t('noReportsYet') }}
        </div> -->

        <div v-if="unreadUnder.length" class="unread-chats-indicator under">
          {{ unreadUnder.length }}
        </div>
      </div>
      <v-divider class="mx-0"></v-divider>
      <div v-if="task && task.status !== 'idle'" class="d-flex align-center">
        <v-textarea
          v-if="!showVoiceNote"
          ref="text"
          v-model="reportText"
          :placeholder="$t('writeMessage')"
          class="ma-2 chat-form"
          type="text"
          hide-details
          auto-grow
          maxlength="240"
          outlined
          dense
          rows="1"
          rounded
          @keydown.enter.exact.prevent
          @keyup.enter.exact="handleReportTextSave()"
        ></v-textarea>
        <add-voice-note
          v-else
          class="add-voice-note"
          :voice-note-url="voiceNotePreviewUrl"
          :recording="recording"
          @delete-audio="deleteAudio()"
        />

        <v-btn
          v-if="reportText || voiceNotePreviewUrl !== ''"
          class="ml-0 mr-2"
          :disabled="!reportText && voiceNotePreviewUrl === ''"
          icon
          :loading="loading"
          @click="handleReportTextSave()"
        >
          <v-icon class="icon-send" dense color="primary">mdi-send</v-icon>
        </v-btn>
        <v-btn
          v-else
          icon
          class="ml-0 mr-2"
          @mousedown="handleVoiceNote"
          @mouseup="stopVoiceNote"
          @mouseleave="stopVoiceNote"
        >
          <v-icon :color="recording ? 'error' : 'primary'"
            >mdi-microphone</v-icon
          >
        </v-btn>
      </div>
    </div>
  </v-slide-x-reverse-transition>
</template>

<script>
import fixWebmDuration from 'fix-webm-duration'
import TextReports from './TextReports.vue'
import AddVoiceNote from '~/components/chats/audio/AddVoiceNote.vue'
export default {
  name: 'TaskChats',
  components: { TextReports, AddVoiceNote },
  data() {
    return {
      reportText: '',
      noAutoScroll: false,
      loading: false,
      recording: false,
      showVoiceNote: false,
      voiceNotePreviewUrl: '',
      recorder: null,
      blobVoice: null,
      fileForSend: [],
      unreadOver: [],
      unreadUnder: [],
    }
  },

  computed: {
    hightlightTaskChat() {
      return this.$store.state.oos.orders.hightlightTaskChat
    },
    showTaskChats() {
      return this.$store.state.oos.orders.showTaskChats
    },
    showTaskInfoDrawer() {
      return this.$store.state.oos.orders.showTaskInfoDrawer
    },
    showJobNotesDrawerOos() {
      return this.$store.state.oos.orders.showJobNotesDrawerOos
    },
    showPropertyHistoryDrawerOos() {
      return this.$store.state.oos.orders.showPropertyHistoryDrawerOos
    },
    task() {
      return this.$store.getters['oos/orders/getTaskSelect']
    },
    selectOrder() {
      return this.$store.state.oos.routes.selectOrder
    },
    taskchatFormatted() {
      if (!this.task) return []
      return this.task.taskChats
        .filter((chat) => chat)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
    },
    scrollChatZone: {
      get() {
        return this.$store.state.chats.scrollChatZone
      },
      set(payload) {
        this.$store.commit('oos/orders/set_scrollChatZone', payload)
      },
    },
  },
  watch: {
    scrollChatZone(val) {
      if (val) {
        this.handleScrollChat()
      }
    },
    showTaskChats: {
      handler() {
        setTimeout(() => {
          if (!this.hightlightTaskChat) {
            this.handleScrollChat()
          } else {
            this.handleScrollChat(this.hightlightTaskChat)
          }
        }, 200)
      },
      immediate: true,
    },
    hightlightTaskChat(val) {
      if (val && this.showTaskChats) {
        this.handleScrollChat(val)
      }
    },
  },

  methods: {
    handleTaskChats(val) {
      this.$store.commit('oos/orders/set_showTaskChats', val)
    },
    handleUnreadOver({ over, chatId }) {
      if (over) {
        this.unreadOver.push(chatId)
      } else {
        const idx = this.unreadOver.findIndex((cid) => cid === chatId)
        if (idx > -1) {
          this.unreadOver.splice(idx, 1)
        }
      }
    },
    handleUnreadBelow({ below, chatId }) {
      if (below) {
        this.unreadUnder.push(chatId)
      } else {
        const idx = this.unreadUnder.findIndex((cid) => cid === chatId)
        if (idx > -1) {
          this.unreadUnder.splice(idx, 1)
        }
      }
    },
    async handleReportTextSave() {
      if (
        !this.reportText &&
        !this.reportText.trim() &&
        this.voiceNotePreviewUrl === ''
      ) {
        return
      }

      this.loading = true
      const _text = this.reportText
      this.reportText = ''
      let mediaType = 'text'
      let file = null
      if (this.voiceNotePreviewUrl !== '') {
        file = new File([this.blobVoice], 'Voice note', {
          type: 'audio/webm',
        })
        file.codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        this.fileForSend.push(file)
        mediaType = 'audio'
      }

      try {
        await this.$store.dispatch('oos/orders/handleReportTextSave', {
          taskId: this.task.id,
          orderId: this.selectOrder,
          text: _text,
          type: this.task.type,
          mediaType,
          task: { taskId: this.task.id, type: this.task.type },
          attachmentFile: this.fileForSend,
        })
        this.loading = false
        this.handleScrollChat(null, true)
        this.noAutoScroll = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.resetForm()
        this.loading = false
      }
    },
    resetForm() {
      this.reportText = ''
      this.fileForSend = []
      this.showVoiceNote = false
      this.recorder = null
      this.voiceNotePreviewUrl = ''
      this.duration = null
      this.blobVoice = null
    },
    handleScrollChat(target, holdScroll) {
      if (this.noAutoScroll) {
        return
      }
      const chatZone = this.$refs.chatZone

      if (!chatZone) {
        return
      }

      let positioToScroll = chatZone.scrollHeight
      this.$nextTick(() => {
        let targetEl = null

        if (target) {
          targetEl = self.document.querySelector(`#chat-${target}`)
        }

        if (targetEl) {
          positioToScroll = targetEl.offsetTop - 100
        }
        chatZone.scroll({
          top: positioToScroll,
          behavior: 'smooth',
        })
        this.scrollChatZone = false
        if (holdScroll) {
          this.noAutoScroll = true
        }
        if (this.hightlightTaskChat) {
          setTimeout(() => {
            this.$store.commit('oos/orders/set_hightlightTaskChat', null)
          }, 3000)
        }
      })
    },
    handleVoiceNote() {
      // Verificar la api de mediaDevices esta presente
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // eslint-disable-next-line
        console.log('getUserMedia not supported on your browser!')
        return
      }
      this.recording = true
      setTimeout(() => {
        if (!this.recording) {
          this.$mainAlertInfo('Please keep pressed to record an audio message')
          return
        }
        this.showVoiceNote = true
        this.showEmoticones = false
        let audioChunks = []
        let startRecordingTime = 0

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            this.recorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm;codecs=opus',
            })

            this.recorder.onstop = async (e) => {
              const duration = Date.now() - startRecordingTime
              const blob = new Blob(audioChunks, { type: 'audio/webm' })
              audioChunks = []
              const fixedBlob = await fixWebmDuration(blob, duration, {
                logger: false,
              })

              this.voiceNotePreviewUrl = window.URL.createObjectURL(fixedBlob)
              this.blobVoice = fixedBlob
              stream.getTracks().forEach((track) => track.stop())
            }

            this.recorder.ondataavailable = (e) => {
              audioChunks.push(e.data)
            }
            startRecordingTime = Date.now()
            this.recorder.start()
          })
          .catch((error) => {
            // eslint-disable-next-line
            console.log(error)
          })
      }, 100)
    },
    stopVoiceNote() {
      this.recording = false
      if (this.recorder === null && this.voiceNotePreviewUrl === '') {
        this.showVoiceNote = false
        return
      }
      this.recorder.stop()
    },
    deleteAudio() {
      this.showVoiceNote = false
      this.recorder = null
      this.voiceNotePreviewUrl = ''
      this.duration = null
      this.blobVoice = null
      this.fileForSend = []
    },
  },
}
</script>

<style lang="scss" scoped>
.chats {
  position: absolute;
  bottom: 0;
  right: 0;
  margin-inline-end: 12px;

  min-height: 35vh;
  height: 35%;
  min-width: 300px;
  max-width: 300px;
  overflow: hidden;
  border-radius: 5px;
  transition: right 280ms ease-in-out;
}
.chat-container {
  z-index: 5;
  background-color: var(--clr-bg-alt);
}
.chat-form {
  position: relative;
}
.no-reports-text {
  font-size: 0.73rem;
  color: var(--v-info-base);
}
.chat-zone {
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
.unread-chats-indicator {
  position: sticky;
  width: 24px;
  aspect-ratio: 1;
  background-color: var(--v-error-base);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100vw;
  left: 4px;
  font-weight: 700;
  z-index: 1;
  &.under {
    bottom: 4px;
  }
  &.over {
    top: 4px;
  }
}
.add-voice-note {
  padding: 0.6rem 0.75rem;
  margin: 8px;
  width: 100%;
  border: 1px solid var(--v-primary-base);
  border-radius: 20px;
  outline: none;
}
.icon-send {
  margin-bottom: 3px;
  transform: rotate(-45deg);
}
</style>
