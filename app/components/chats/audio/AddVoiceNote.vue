<template>
  <div class="container-voice-note | d-flex justify-space-around align-center">
    <v-btn icon x-small @click="handleAudio()">
      <v-icon v-if="recording" color="red">mdi-circle</v-icon>
      <v-icon v-else size="30" color="primary">{{
        !showAudio ? 'mdi-play' : 'mdi-pause'
      }}</v-icon>
    </v-btn>

    <span v-if="recording" class="caption ml-4">{{ recordedTimeString }}</span>
    <span v-else-if="duration !== null" class="caption ml-4">{{
      duration
    }}</span>
    <v-btn class="ml-auto" icon x-small @click="handleDeleteAudio()">
      <v-icon color="error">mdi-delete</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'AddVoiceNote',
  props: {
    voiceNoteUrl: { type: String, default: '' },
    recording: { type: Boolean, default: false },
  },

  data() {
    return {
      duration: null,
      timeAudioInterval: null,
      showAudio: false,
      audio: null,
      recordedTime: 0,
      recordedTimeInterval: null,
    }
  },
  computed: {
    recordedTimeString() {
      return this.setDurationAudio(this.recordedTime)
    },
  },
  watch: {
    async voiceNoteUrl(value) {
      if (!value) return

      const { audio, audioDuration } = await this.initAudio(value)
      this.audio = audio
      this.duration = this.setDurationAudio(audioDuration)
    },
    recording: {
      handler(value) {
        if (!value) {
          this.stopRecorderTime()
          return
        }
        this.startRecordingTime()
      },
      immediate: true,
    },
  },

  methods: {
    startRecordingTime() {
      this.recordedTime = 0
      this.recordedTimeInterval = setInterval(() => {
        this.recordedTime += 1
      }, 1000)
    },
    stopRecorderTime() {
      clearInterval(this.recordedTimeInterval)
    },
    initAudio(audioUrl) {
      return new Promise((resolve) => {
        const _audio = new Audio()

        _audio.onloadedmetadata = () => {
          resolve({
            audio: _audio,
            audioDuration: _audio.duration,
          })
        }
        _audio.src = audioUrl
      })
    },
    setDurationAudio(time) {
      const sec = parseInt(time % 60)
        .toString()
        .padStart(2, '0')
      const min = (Math.floor(time / 60) % 60).toString().padStart(2, '0')
      return `${min}:${sec}`
    },
    loopAudio(time) {
      this.timeAudioInterval = setInterval(() => {
        this.duration = this.setDurationAudio(
          parseInt(time) - parseInt(this.audio.currentTime.toFixed())
        )
        if (this.audio.paused) {
          this.duration = this.setDurationAudio(this.audio.duration)
          clearInterval(this.timeAudioInterval)
        }
        if (this.audio.ended) {
          this.duration = this.setDurationAudio(this.audio.duration)
          clearInterval(this.timeAudioInterval)
          this.showAudio = false
        }
      }, 1000)
    },
    handleAudio() {
      if (!this.showAudio) {
        this.audio = new Audio(this.voiceNoteUrl)
        this.audio.play()
        this.audio.preload = 'metadata'

        this.audio.onloadedmetadata = () => this.loopAudio(this.audio.duration)
      } else {
        this.audio.pause()
      }

      this.showAudio = !this.showAudio
    },
    handleDeleteAudio() {
      this.$emit('delete-audio')
    },
  },
}
</script>

<style lang="scss" scoped></style>
