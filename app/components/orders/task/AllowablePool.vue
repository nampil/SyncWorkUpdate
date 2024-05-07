<template>
  <div class="allowable-pool | pa-4 mb-4">
    <div class="head | d-flex align-center justify-space-between">
      <div class="heading">
        <p class="ma-0 text-h6">{{ allowablepool.title }}</p>
        <p>{{ allowablepool.desc }}</p>
      </div>
      <div class="max-va">
        <p class="text--secondary ma-0">{{ $t('maxValue') }}</p>
        <p class="font-weight-bold text-h6 text-center">
          ${{ allowablepool.maxValue }}
        </p>
      </div>
    </div>
    <div v-if="allowablepool?.pictures?.length" class="pictures">
      <div
        v-for="(pic, index) in allowablepool.pictures"
        :key="index"
        class="picture-container"
      >
        <img
          v-if="pic.type.includes('image')"
          :src="pic.url"
          alt=""
          height="68px"
          width="68px"
          @mousemove="zoomHover($event, pic)"
          @mouseleave="zoomLeave($event)"
          @click="handlerShowImagesSlides(pic.codeName, allowablepool.pictures)"
        />
        <div
          v-if="pic.type.includes('pdf')"
          class="file-preview d-flex align-center justify-center"
          @click="handleViewPdf(pic.url)"
        >
          <v-icon large>mdi-file-pdf-box</v-icon>
        </div>
      </div>
    </div>

    <p
      v-if="
        allowablepool.itemsForInvoices && allowablepool.itemsForInvoices.length
      "
      class="mb-2 text--small primary--text"
    >
      {{ $t('itemsForInvoices') }}
    </p>
    <p v-else class="text--small error--text">
      *
      {{
        $t(
          'You need to edit what is allowed and add elements for the invoices, it is necessary for it to be displayed in the App'
        )
      }}.
    </p>

    <ul
      v-if="
        allowablepool.itemsForInvoices && allowablepool.itemsForInvoices.length
      "
      class="invoice-items-list"
    >
      <li v-for="(item, i) in allowablepool.itemsForInvoices" :key="i">
        <div class="item-for-invoice">
          <div class="item-header">
            <p class="item-title">{{ item.title }}</p>
            <p class="item-desc">{{ item.desc }}</p>
          </div>
          <p class="item-unit | ma-0">{{ item.unidad }}</p>
          <p class="item-price | ma-0">{{ item.price }}</p>
        </div>
      </li>
    </ul>
    <div
      v-if="allowablepool.needSupervisorApproval"
      class="text--secondary text--small"
    >
      * {{ $t('This jobs need to be approved by admin before create tasks') }}
    </div>
    <div class="actions | mt-4 d-flex">
      <v-spacer></v-spacer>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            small
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="$emit('edit')"
          >
            <v-icon small>mdi-pencil-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('editTask') }}</span>
      </v-tooltip>

      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn small icon v-bind="attrs" v-on="on">
            <v-icon
              small
              color="red"
              :disabled="disabled"
              @click="showDeleteTask = !showDeleteTask"
              >mdi-delete</v-icon
            >
          </v-btn>
        </template>
        <span>{{ $t('deleteTask') }}</span>
      </v-tooltip>
    </div>
    <slide-show
      v-if="allowablepool.pictures && allowablepool.pictures.length"
      :list="listImg"
      :show="showImagesSlides"
      :title="$t('ImagesView') + ' ' + allowablepool.title"
      type="images"
      :index-selected="indexOfImage"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
    <v-dialog
      v-model="showDeleteTask"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <delete-task-modal
        @close="showDeleteTask = false"
        @delete="handleDeleteTask()"
      />
    </v-dialog>
  </div>
</template>

<script>
import PdfViewer from '@/components/misc/PdfViewer.vue'
import SlideShow from '@/components/misc/SlideShow.vue'
import DeleteTaskModal from '@/components/orders/task/DeleteTaskModal.vue'
export default {
  name: 'AllowablePool',
  components: { PdfViewer, SlideShow, DeleteTaskModal },
  props: {
    allowablepool: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      showImagesSlides: false,
      listImg: [],
      indexOfImage: 0,
      previewUrl: '',
      showPdfViewer: '',
      showDeleteTask: false,
    }
  },
  methods: {
    handleDeleteTask() {
      this.$emit('delete')
      this.showDeleteTask = !this.showDeleteTask
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    zoomHover(event, pic) {
      const elementImg = event.target
      const box = elementImg.getBoundingClientRect()
      const position = JSON.parse(JSON.stringify(box))
      this.$store.commit('set_lupaOptions', { url: pic.url, position })
      this.$store.commit('set_showLupa', true)
    },
    zoomLeave(event, id) {
      this.$store.commit('set_showLupa', false)
    },
    handlerShowImagesSlides(codeName, list) {
      this.showImagesSlides = true
      this.listImg = list.filter((pic) => pic.type.includes('image'))
      this.indexOfImage = this.listImg.findIndex((c) => c.codeName === codeName)
    },
  },
}
</script>

<style lang="scss" scoped>
.allowable-pool {
  background-color: var(--clr-bg-alt);
  border-radius: 0.25rem;
}
.head {
  gap: 1rem;
}
.max-va {
  min-width: 100px;
  text-align: center;
}
.pictures {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;

  .picture-container img {
    border-radius: 4px;
  }
}
.invoice-items-list {
  background-color: var(--v-terciary-base);
  padding: 0;
}
.item-for-invoice {
  display: grid;
  grid-template-columns: 1fr minmax(100px, auto) minmax(100px, auto);
  align-content: center;
  align-items: center;
  padding: 0.5rem;
  // .item-header {
  // }
  .item-title {
    font-weight: bold;
    margin: 0;
  }
  .item-desc {
    opacity: 0.8;
    margin: 0;
  }
  .item-unit {
    text-align: right;
  }
  .item-price {
    text-align: right;
  }
}
</style>
