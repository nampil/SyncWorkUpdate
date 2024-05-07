<template>
  <div v-if="src" class="pdf-viewer">
    <v-toolbar dark color="#333" class="flex-grow-0" dense>
      <v-toolbar-title>Visor PDF</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon :disabled="zoom <= 40" @click="zoom -= 20"
        ><v-icon>mdi-magnify-minus-outline</v-icon></v-btn
      >
      <v-btn icon :disabled="zoom >= 200" @click="zoom += 20"
        ><v-icon>mdi-magnify-plus-outline</v-icon></v-btn
      >
      <v-btn icon @click="rotate -= 90"><v-icon>mdi-rotate-left</v-icon></v-btn>
      <v-spacer></v-spacer>
      <a :href="url" target="blank" download
        ><v-btn icon><v-icon>mdi-archive-arrow-down-outline</v-icon></v-btn></a
      >

      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-progress-linear
      v-model="progress"
      :active="loading"
      color="primary"
    ></v-progress-linear>
    <client-only>
      <div class="pdf-wrapper text-center pa-4">
        <vue-pdf
          ref="pdfComp"
          class="your-pdf-class"
          :src="url"
          :page="1"
          :style="`width: ${zoom}%; margin: 0 auto;`"
          :rotate="rotate"
          @loaded="loading = false"
          @num-pages="numPages = $event"
          @progress="handleProgress"
        ></vue-pdf>

        <div v-if="numPages > 1">
          <div v-for="(pageNum, index) in numPages" :key="index">
            <vue-pdf
              v-if="pageNum > 1"
              :src="url"
              :page="pageNum"
              :rotate="rotate"
              :style="`width: ${zoom}%; margin: 0 auto;`"
            >
            </vue-pdf>
          </div>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script>
import VuePdf from 'vue-pdf'
let dragscroll = null
if (process.client) {
  dragscroll = require('vue-dragscroll')
}
export default {
  name: 'PdfViewer',

  components: { VuePdf },

  directives: {
    dragscroll,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data(vm) {
    return {
      loading: true,
      progress: 0,
      rotate: 0,
      zoom: 100,
      numPages: 0,
    }
  },
  computed: {
    src() {
      return this.url
    },
  },
  mounted() {},
  methods: {
    print() {
      const pages = []
      for (let i = 0; i < this.numPages; i++) {
        pages.push(i + 1)
      }

      this.$refs.pdfComp[0].print(100, pages)
    },
    download() {},
    handleProgress(val) {
      this.progress = val * 100
    },
  },
}
</script>

<style lang="scss" scoped>
.pdf-viewer {
  overflow: hidden;
  height: 100%;
}
.pdf-wrapper {
  overflow-y: auto;
  height: 100%;
  max-height: 90vh;
  background-color: #fff;
}
</style>
