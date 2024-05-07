<template>
  <div
    v-if="taskSelected"
    :class="['drawer-wrapper  overflow-hidden flex-shrink-0', { open: open }]"
  >
    <v-navigation-drawer v-model="open" right width="300" absolute>
      <!-- <h3 class="info--text">{{ $t('taskInfo') }}</h3> -->

      <v-tabs v-model="tab" fixed-tabs background-color="terciary">
        <v-tab v-for="item in items" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>

      <div v-if="taskSelected" class="task-desc | h-100">
        <v-tabs-items v-model="tab" tag>
          <v-tab-item class="h-100">
            <div class="task-desc_content | pa-2">
              <div class="seccion-desc | pl-2 pr-2">
                <h4>
                  {{ taskSelected.title }}
                </h4>
                <h4
                  v-if="taskSelected.pictures && taskSelected.pictures.length"
                  class="sub-title mb-1"
                >
                  {{ $t('filesAttached') }}
                </h4>
                <div
                  v-if="taskSelected.pictures && taskSelected.pictures.length"
                  class="previews"
                >
                  <div
                    v-for="(pic, index) in taskSelected.pictures"
                    :key="index"
                    class="preview"
                  >
                    <img
                      v-if="pic.type.includes('image')"
                      class="img-task"
                      :src="pic.url"
                      alt=""
                      height="63px"
                      width="63px"
                      @click="handlerShowImagesSlides(pic.codeName, 'task')"
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

                <span>{{ taskSelected.desc }}</span>

                <div
                  v-if="
                    taskSelected.materialsOrTools &&
                    taskSelected.materialsOrTools.length
                  "
                  class="mt-2"
                >
                  <span class="text-body-2 font-weight-bold">{{
                    $t('materialsOrTools')
                  }}</span>
                  <div class="d-flex flex-wrap wraper">
                    <div
                      v-for="(material, i) in taskSelected.materialsOrTools"
                      :key="material.id"
                      class="mr-1"
                    >
                      <span class="text-caption">
                        {{ material.title
                        }}{{
                          i !== taskSelected.materialsOrTools.length - 1
                            ? ','
                            : '.'
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <v-divider class="mt-2 mb-2"></v-divider>
              <div
                v-if="
                  taskSelected &&
                  taskSelected.needProcessTimes &&
                  taskSelected.type !== JOB_TYPES.inspections
                "
              >
                <task-info-section
                  :reports-approved="taskSelected.beforeReportsApproved"
                  :requirements="requirementsFromBefore"
                  :type="PROCESS_TIME_TYPES.before"
                  :task-selected="taskSelected"
                />

                <v-divider class="mt-2 mb-2"></v-divider>

                <task-info-section
                  :reports-approved="taskSelected.duringReportsApproved"
                  :requirements="requirementsFromDuring"
                  :type="PROCESS_TIME_TYPES.during"
                />
                <v-divider class="mt-2 mb-2"></v-divider>
                <task-info-section
                  :reports-approved="taskSelected.afterReportsApproved"
                  :requirements="requirementsFromAfter"
                  :type="PROCESS_TIME_TYPES.after"
                />
              </div>
              <div
                v-else-if="taskSelected.type !== JOB_TYPES.inspections"
                class="seccion-reports | ml-2 mr-2"
              >
                <v-icon
                  :size="
                    taskSelected.generalReportsApproved ||
                    validateReportsApprovedGeneral
                      ? 20
                      : 14
                  "
                  :color="
                    taskSelected.generalReportsApproved ||
                    validateReportsApprovedGeneral
                      ? 'success'
                      : 'grey'
                  "
                  :class="
                    taskSelected.generalReportsApproved ||
                    validateReportsApprovedGeneral
                      ? 'icon-check'
                      : ''
                  "
                  >{{
                    taskSelected.generalReportsApproved ||
                    validateReportsApprovedGeneral
                      ? 'mdi-check-bold'
                      : 'mdi-brightness-1'
                  }}</v-icon
                >
                <span
                  class="font-weight-bold"
                  :class="
                    taskSelected.generalReportsApproved ||
                    validateReportsApprovedGeneral
                      ? ''
                      : 'ml-1'
                  "
                  >{{ $t('reports') }}</span
                >
              </div>
              <div
                v-else-if="
                  taskSelected &&
                  taskSelected.type === JOB_TYPES.inspections &&
                  taskSelected.areasInReports &&
                  taskSelected.areasInReports.length &&
                  taskSelected.reportsApprovedByArea
                "
              >
                <div
                  v-for="(area, i) in taskSelected.areasInReports"
                  :key="i"
                  class="seccion-inspections"
                >
                  <div class="ml-2 mr-2">
                    <v-icon
                      :size="taskSelected.reportsApprovedByArea[area] ? 20 : 14"
                      :color="
                        taskSelected.reportsApprovedByArea[area]
                          ? 'success'
                          : 'grey'
                      "
                      :class="
                        taskSelected.reportsApprovedByArea[area]
                          ? 'icon-check'
                          : ''
                      "
                      >{{
                        taskSelected.reportsApprovedByArea[area]
                          ? 'mdi-check-bold'
                          : 'mdi-brightness-1'
                      }}</v-icon
                    >
                    <span
                      class="font-weight-bold"
                      :class="
                        taskSelected.reportsApprovedByArea &&
                        taskSelected.reportsApprovedByArea[area]
                          ? ''
                          : 'ml-1'
                      "
                    >
                      {{ area }}
                    </span>
                    <div
                      v-if="
                        taskSelected &&
                        taskSelected.requirements &&
                        taskSelected.requirements.length
                      "
                    >
                      <!-- <h4
                    v-if="
                      taskSelected.requirements
                        .map((r) => r.inspectionArea)
                        .includes(area)
                    "
                    class="title-requirement | ml-6"
                  >
                    {{ $t('requirements') }}
                  </h4> -->
                      <div
                        v-for="requirement in taskSelected.requirements"
                        :key="requirement.id"
                        class="ml-6"
                      >
                        <div v-if="area === requirement.inspectionArea">
                          <v-icon
                            :size="requirement.oosChecked ? 20 : 14"
                            :color="requirement.oosChecked ? 'success' : 'grey'"
                            >{{
                              requirement.oosChecked
                                ? 'mdi-check-bold'
                                : 'mdi-brightness-1'
                            }}</v-icon
                          >
                          <span
                            class="sub-title"
                            :class="requirement.oosChecked ? '' : 'ml-1'"
                          >
                            {{ requirement.descRequirement }}</span
                          >
                          <div
                            v-if="
                              requirement.pictures &&
                              requirement.pictures.length
                            "
                            class="container-photos"
                          >
                            <h4 class="sub-title mb-1">
                              {{ $t('filesAttached') }}
                            </h4>
                            <div class="previews">
                              <div
                                v-for="(pic, index) in requirement.pictures"
                                :key="index"
                                class="preview"
                              >
                                <img
                                  v-if="pic.type.includes('image')"
                                  class="img-task"
                                  :src="pic.url"
                                  alt=""
                                  height="63px"
                                  width="63px"
                                  @click="
                                    handlerShowImagesSlides(
                                      pic.codeName,
                                      'requirement',
                                      requirement
                                    )
                                  "
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <v-divider
                    v-if="taskSelected.areasInReports.length !== i + 1"
                    class="mt-2 mb-2"
                  ></v-divider>
                </div>
              </div>
              <!-- <v-divider
            v-if="
              taskSelected.type !== 'inspections' &&
              requirementsFromGeneral &&
              requirementsFromGeneral.length &&
              reportsFromGeneral.length
            "
            class="mb-2 mt-2"
          ></v-divider> -->
              <div
                v-if="taskSelected.type !== JOB_TYPES.inspections"
                class="seccion-requirements-general | ml-2 mr-2 mb-2"
              >
                <div
                  v-if="
                    taskSelected &&
                    requirementsFromGeneral &&
                    requirementsFromGeneral.length
                  "
                  class="ml-6"
                >
                  <!-- <h4 class="title-requirement">{{ $t('requirements') }}</h4> -->
                  <div
                    v-for="requirement in requirementsFromGeneral"
                    :key="requirement.id"
                  >
                    <v-icon
                      :size="requirement.oosChecked ? 20 : 14"
                      :color="requirement.oosChecked ? 'success' : 'grey'"
                      >{{
                        requirement.oosChecked
                          ? 'mdi-check-bold'
                          : 'mdi-brightness-1'
                      }}</v-icon
                    >
                    <span
                      class="sub-title"
                      :class="requirement.oosChecked ? '' : 'ml-1'"
                    >
                      {{ requirement.descRequirement }}</span
                    >

                    <div class="container-photos">
                      <h4
                        v-if="
                          requirement.pictures && requirement.pictures.length
                        "
                        class="sub-title mb-1"
                      >
                        {{ $t('filesAttached') }}
                      </h4>
                      <div
                        v-if="
                          requirement.pictures && requirement.pictures.length
                        "
                        class="previews"
                      >
                        <div
                          v-for="(pic, index) in requirement.pictures"
                          :key="index"
                          class="preview"
                        >
                          <img
                            v-if="pic.type.includes('image')"
                            class="img-task"
                            :src="pic.url"
                            alt=""
                            height="63px"
                            width="63px"
                            @click="
                              handlerShowImagesSlides(
                                pic.codeName,
                                'requirement',
                                requirement
                              )
                            "
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-tab-item>

          <v-tab-item class="h-100">
            <div class="instructions-content | h-100 pa-4 pt-2">
              <p
                v-for="(text, index) in taskSelected?.instructions?.split('\n')"
                :key="index"
              >
                <v-icon size="14" color="grey" class="mr-1"
                  >mdi-brightness-1</v-icon
                >
                {{ text }}
              </p>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-navigation-drawer>
    <slide-show
      v-if="taskSelected"
      :list="listImg"
      :show="showImagesSlidesDesc"
      :title="taskSelected.title"
      type="images"
      :index-selected="indexOfImageDesc"
      @close="showImagesSlidesDesc = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </div>
</template>

<script>
import TaskInfoSection from './TaskInfoSection.vue'
import SlideShow from '~/components/misc/SlideShow.vue'
import PdfViewer from '~/components/misc/PdfViewer.vue'
import { JOB_TYPES, PROCESS_TIME_TYPES } from '@/utils/dictionaries'

export default {
  components: { SlideShow, PdfViewer, TaskInfoSection },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      JOB_TYPES: null,
      PROCESS_TIME_TYPES: null,
      open: false,
      listImg: [],
      showImagesSlidesDesc: false,
      indexOfImageDesc: 0,
      showPdfViewer: false,
      previewUrl: '',
      tab: null,
      items: ['Task Info', 'Instructions'],
    }
  },
  computed: {
    taskSelected() {
      return this.$store.getters['oos/order/getTaskSelect']
    },

    requirementsFromBefore() {
      if (!this.taskSelected?.requirements?.length) {
        return []
      }
      return this.taskSelected.requirements
        .filter((r) => r.fromBefore)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromDuring() {
      if (!this.taskSelected?.requirements?.length) {
        return []
      }
      return this.taskSelected.requirements
        .filter((r) => r.fromDuring)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromAfter() {
      if (!this.taskSelected?.requirements?.length) {
        return []
      }
      return this.taskSelected.requirements
        .filter((r) => r.fromAfter)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    requirementsFromGeneral() {
      if (!this.taskSelected?.requirements?.length) {
        return []
      }
      return this.taskSelected.requirements
        .filter((r) => r.fromGeneral)
        .sort((a, b) => (a.position > b.position ? 1 : -1))
    },
    reportsFromGeneral() {
      if (!this.taskSelected?.reports?.length) {
        return []
      }
      return this.taskSelected.reports.filter((r) => !r.fromRequirement)
    },
    validateReportsApprovedGeneral() {
      if (!this.requirementsFromGeneral.length) {
        return false
      }
      for (let i = 0; i < this.requirementsFromGeneral.length; i++) {
        const requirement = this.requirementsFromGeneral[i]
        if (!requirement.oosChecked) {
          return false
        }
      }
      return true
    },
  },
  watch: {
    show: {
      handler(val) {
        this.open = val
      },
      immediate: true,
    },
  },

  created() {
    this.JOB_TYPES = JOB_TYPES
    this.PROCESS_TIME_TYPES = PROCESS_TIME_TYPES
  },

  methods: {
    handlerShowImagesSlides(codeName, type, requirement) {
      if (type === 'task') {
        this.showImagesSlidesDesc = true
        this.listImg = this.taskSelected.pictures.filter((pic) =>
          pic.type.includes('image')
        )
        this.indexOfImageDesc = this.listImg.findIndex(
          (c) => c.codeName === codeName
        )
      } else if (type === 'requirement') {
        this.showImagesSlidesDesc = true

        this.listImg = requirement.pictures.filter((pic) =>
          pic.type.includes('image')
        )
        this.indexOfImageDesc = this.listImg.findIndex(
          (c) => c.codeName === codeName
        )
      }
    },
    handleClosePdfViewer() {
      this.previewUrl = ''
      this.showPdfViewer = false
    },
    handleViewPdf(url) {
      this.previewUrl = url
      this.showPdfViewer = true
    },
  },
}
</script>

<style lang="scss" scoped>
.title-requirement {
  font-size: 0.82rem;
  font-weight: bold;
  color: var(--v-info-darken2);
  margin-top: 0.5rem;
}
.sub-title {
  font-size: 0.77rem;
  font-weight: bold;
  color: var(--v-info-darken1);
}
.task-desc_content {
  overflow-y: auto;
  background-color: var(--v-background_route_update-base);
}
.instructions-content {
  background-color: var(--v-background_route_update-base);
}
.drawer-wrapper {
  width: 0;
  transition: width 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

  &.open {
    width: 300px;
    transition: width 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
.previews {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;

  .file-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .preview,
  .file-preview {
    width: 63px;
    height: 63px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: 4px;
    }
  }
}
.task-desc {
  overflow-y: auto;
  background-color: var(--v-background_route_update-base);
}
::v-deep .v-navigation-drawer__content,
.task-desc {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
.task-desc::-webkit-scrollbar {
  display: none; /* Chrome */
}
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.icon-check {
  margin-top: -4px;
}
</style>
