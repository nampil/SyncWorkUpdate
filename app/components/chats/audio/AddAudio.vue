<template>
  <div class="container-add-audio | d-flex align-center justify-center">
    <v-btn icon small class="mr-1" @click.stop="handleAudio(url)">
      <v-icon color="primary">{{
        !showAudio ? 'mdi-play' : 'mdi-pause'
      }}</v-icon>
    </v-btn>
    <span v-if="duration !== null" class="caption mr-1">{{ duration }}</span>
  </div>
</template>

<script>
export default {
  name: 'AddAudio',
  props: {
    url: { type: String, default: '' },
  },
  data() {
    return {
      showAudio: false,
      audio: null,
      duration: null,
      timeAudioInterval: null,
    }
  },
  watch: {
    url(val) {
      const audioDuration = new Audio(val)
      audioDuration.onloadedmetadata = () =>
        this.setDurationAudio(audioDuration.duration)
    },
  },

  mounted() {
    if (this.url) {
      const audioDuration = new Audio(this.url)
      audioDuration.onloadedmetadata = () =>
        this.setDurationAudio(audioDuration.duration)
    }
  },

  methods: {
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

<style lang="scss" scoped></style>
