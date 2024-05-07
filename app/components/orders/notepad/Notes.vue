<template>
  <div
    ref="orderNotes"
    v-click-outside="handleClickOutside"
    class="order-notes"
    :class="{ minimazed: minimize }"
  >
    <div
      :class="[
        'notes-toolbar | flex-grow-0 d-flex px-2 align-center white--text',
        { minimized: minimize },
      ]"
      @mousedown="hanldeDrag"
    >
      <v-btn icon small dark @click="handleMinimize">
        <v-icon small>mdi-minus</v-icon>
      </v-btn>
      <!--  -->
      <h5 v-if="!minimize" class="h5 notes-title text-truncate ml-4">
        {{ $t('orderNotePad') }}
      </h5>
      <v-spacer></v-spacer>
      <v-btn icon small dark @click="handleClose">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- <v-slide-y-transition> -->
    <div class="content-wrapper flex-grow-1">
      <div class="inner h-100 d-flex flex-column justify-space-between">
        <div ref="scrollZone" class="content |flex-grow-1 pa-2 h-100">
          <!-- <v-textarea
            ref="noteField"
            v-model="localText"
            solo
            :readonly="!writting"
            hide-details
            auto-grow
            :rows="12"
            :min-height="noteInputHeight"
            class="note-field"
          >
          </v-textarea> -->
          <div
            v-if="notes.length >= 20 && !noMoreNotes"
            class="load-more-wrapper | d-flex flex-align-center justify-center pa-4"
          >
            <v-btn class="load-more-btn" icon @click="loadMoreNotes">
              <v-icon>mdi-reload</v-icon>
            </v-btn>
          </div>
          <transition-group name="list">
            <div v-for="note in notes" :key="note.id" class="note | pa-2 mb-2">
              <p class="note-text">{{ note.text }}</p>
              <p class="metadata text--secondary text-right">
                <span
                  class="metadata-name"
                  @mouseenter="handleShowInfoUpdatedBy(note.updatedBy, $event)"
                  @mouseleave="handleShowInfoUpdatedBy(null, $event)"
                  >{{ note.updatedBy.name }}</span
                >
                -
                {{
                  $formatDate(note.updatedAt.toDate(), { relativeToNow: true })
                }}
              </p>
            </div>
          </transition-group>
        </div>
        <div class="input-box | pa-2 d-flex gap-10 align-center">
          <v-textarea
            v-model="localText"
            :label="$t('note')"
            rows="1"
            auto-grow
            outlined
            hide-details
            @keydown.enter="handleEnterDownInTextArea($event)"
            @keyup.enter="handleEnterUpInTextArea($event)"
          ></v-textarea>

          <v-btn
            color="primary"
            fab
            :disabled="!localText.trim()"
            @click="handleSave"
          >
            <v-icon>mdi-send </v-icon>
          </v-btn>
        </div>

        <!-- <div class="note-footer px-4 pb-2">
          <p v-if="notes.length" class="metadata | text--secondary ma-0">
            Updated by
            {{ notes[0].updatedBy.fullName }},
            {{
              $formatDate(notes[0].updatedAt.toDate(), { relativeToNow: true })
            }}
          </p>
        </div> -->
      </div>
    </div>
    <!-- </v-slide-y-transition> -->
    <div
      v-show="showInfoUpdatedBy"
      ref="profileCard"
      class="extra-info | elevation-2 pa-2 rounded"
    >
      <div v-if="loadinginfoUpdatedBy" class="loading">
        <v-progress-circular :value="100" color="primary"></v-progress-circular>
      </div>
      <div v-else-if="infoUpdatedBy" class="perfil">
        <div class="profile-head | d-flex gap-4 align-center">
          <v-avatar size="32" color="red">
            <img
              v-if="infoUpdatedBy.avatar"
              :src="infoUpdatedBy.avatar.url"
              alt="alt"
            />
            <span v-else>{{
              infoUpdatedBy.name.charAt(0).toUpperCase() +
              infoUpdatedBy.lastName.charAt(0).toUpperCase()
            }}</span>
          </v-avatar>

          <div class="profile-name">
            <p class="mb-0">{{ infoUpdatedBy.fullName }}</p>
            <p v-if="infoUpdatedBy.nickName">
              {{ infoUpdatedBy.nickName }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderNotes',
  props: {
    orderId: { type: String, required: true },
    closing: { type: Boolean, default: false },
  },
  data() {
    return {
      pos3: 0,
      pos4: 0,

      writting: false,
      noteInputHeight: 200,
      localText: '',
      noScroll: false,
      showInfoUpdatedBy: false,
      infoUpdatedBy: null,
      loadinginfoUpdatedBy: false,
      noMoreNotes: false,
    }
  },
  computed: {
    minimize: {
      get() {
        return this.$store.state.notes.minimize
      },
      set(val) {
        this.$store.commit('notes/set_minimize', val)
      },
    },
    posX: {
      get() {
        return this.$store.state.notes.posX
      },
      set(val) {
        this.$store.commit('notes/set_posX', val)
      },
    },
    posY: {
      get() {
        return this.$store.state.notes.posY
      },
      set(val) {
        this.$store.commit('notes/set_posY', val)
      },
    },

    notes() {
      return [...this.$store.state.notes.notes].sort((a, b) => {
        if (a.updatedAt.seconds > b.updatedAt.seconds) {
          return 1
        }
        if (a.updatedAt.seconds < b.updatedAt.seconds) {
          return -1
        }

        return 0
      })
    },
  },
  watch: {
    closing(val) {
      if (val) {
        this.minimize = true
      }
    },
    notes(val) {
      if (val && val.length) {
        if (!this.noScroll) {
          setTimeout(() => {
            const scrollZone = this.$refs.scrollZone

            scrollZone.scroll({
              top: scrollZone.scrollHeight,
              behavior: 'smooth',
            })
          }, 100)
        }
      }
    },
  },

  async beforeMount() {
    await this.$store.dispatch('notes/getNotes', { orderId: this.orderId })
  },

  mounted() {
    const orderNoteEl = this.$refs.orderNotes
    const box = orderNoteEl.getBoundingClientRect()

    if (this.posX <= 0 || this.posY <= 0) {
      const spacing = 16
      this.posX = spacing
      this.posY = window.innerHeight - box.height - spacing
    }

    orderNoteEl.style.left = this.posX + 'px'
    orderNoteEl.style.top = this.posY + 'px'
    this.checkBounds()
  },
  beforeDestroy() {
    this.$store.commit('notes/flush_state')
  },

  methods: {
    handleEnterDownInTextArea(e) {
      if ((e.keyCode || e.which) === 13 && !e.shiftKey) {
        e.preventDefault()
      }
    },
    handleEnterUpInTextArea(e) {
      if (
        (e.keyCode || e.which) === 13 &&
        !e.shiftKey &&
        this.localText.trim()
      ) {
        e.preventDefault()
        this.handleSave()
      }
    },
    handleShowInfoUpdatedBy(profile, e) {
      this.infoUpdatedBy = profile
      const profileCard = this.$refs.profileCard

      const targetBox = e.target.getBoundingClientRect()

      const spacing = 4
      let top = -999
      let left = -999
      profileCard.style.left = left + 'px'
      profileCard.style.top = top + 'px'
      this.$nextTick(() => {
        this.showInfoUpdatedBy = !!profile
      })
      if (profile) {
        setTimeout(() => {
          const bottomLimit = window.innerHeight
          const rightLimit = window.innerWidth
          const profileCardBox = profileCard.getBoundingClientRect()

          top = targetBox.bottom + spacing
          left = targetBox.left

          if (left < 4) {
            left = 4
          }
          if (top < 4) {
            top = 4
          }
          if (top + profileCardBox.height > bottomLimit) {
            top = targetBox.top - spacing - profileCardBox.height
          }

          if (left + profileCardBox.width > rightLimit) {
            left = rightLimit - profileCardBox.width - spacing
          }
          profileCard.style.left = left + 'px'
          profileCard.style.top = top + 'px'
        }, 500)
      }
    },

    async loadMoreNotes() {
      try {
        this.loading = true
        this.noScroll = true
        const res = await this.$store.dispatch('notes/getMoreNotes', {
          orderId: this.orderId,
          lastNoteId: this.notes[0].id,
        })

        if (res.noMore) {
          this.noMoreNotes = true
        }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading more notes', error)

        this.$mainAlertError('Error loading more notes')
      } finally {
        this.noScroll = false
        this.loading = false
      }
    },

    async handleSave() {
      try {
        this.loading = true

        await this.$store.dispatch('notes/addNote', {
          orderId: this.orderId,
          text: this.localText,
        })
        this.localText = ''
      } catch (error) {
        // eslint-disable-next-line
        console.log('error saving note', error)
        this.$mainAlertError('Error saving note')
      } finally {
        this.loading = true
      }

      this.writting = false
    },
    handleWrite() {
      this.writting = true
    },
    handleClose() {
      this.$emit('close-notes')
    },
    handleMinimize(close) {
      this.minimize = !this.minimize

      setTimeout(() => {
        this.checkBounds()
      }, 500)
    },
    hanldeDrag(e) {
      e = e || window.event
      e.preventDefault()
      this.pos3 = e.clientX
      this.pos4 = e.clientY

      document.onmouseup = this.closeDragElement
      document.onmousemove = this.elementDrag
    },
    elementDrag(e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      this.posX = this.pos3 - e.clientX
      this.posY = this.pos4 - e.clientY
      this.pos3 = e.clientX
      this.pos4 = e.clientY

      const elmnt = this.$refs.orderNotes

      const left = elmnt.offsetLeft - this.posX
      const top = elmnt.offsetTop - this.posY

      // set the element's new position:
      elmnt.style.top = top + 'px'
      elmnt.style.left = left + 'px'
      this.posY = top
      this.posX = left
    },
    closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null
      document.onmousemove = null
      this.checkBounds()
    },

    checkBounds() {
      const el = this.$refs.orderNotes
      const rect = el.getBoundingClientRect()

      const bottomLimit = window.innerHeight
      const rightLimit = window.innerWidth

      if (rect.top < 0) {
        el.style.top = 0
      }
      if (rect.left < 0) {
        el.style.left = 0
      }
      if (rect.right > rightLimit) {
        el.style.left = rightLimit - rect.width + 'px'
      }
      if (rect.bottom > bottomLimit) {
        el.style.top = bottomLimit - rect.height + 'px'
      }
    },

    handleClickOutside() {
      if (this.minimize) return
      this.minimize = !this.minimize
    },
  },
}
</script>

<style lang="scss" scoped>
.order-notes {
  position: fixed;
  resize: both;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-width: 600px;
  max-height: 600px;
  display: flex;
  isolation: isolate;
  flex-direction: column;
  z-index: 9999;
  box-shadow: 0px 4px 12px rgba($color: #000000, $alpha: 0.2);
  transition-property: border-radius, max-width, max-height;
  transition-duration: 100ms, 300ms, 200ms;
  transition-delay: 150ms, 0ms;
  transition-timing-function: cubic-bezier(0.8, 0.01, 0.24, 1);

  &.minimazed {
    resize: none;
    max-width: 75px;
    max-height: 75px;
    border-radius: 75px;
  }
  .notes-toolbar {
    background-color: var(--v-primary-base);
    z-index: 99;
    width: 100%;
    height: 100%;
    min-height: 42px;
    max-width: 600px;
    max-height: 42px;
    overflow: hidden;
    transition-property: min-height, max-width, max-height, border-radius,
      background-color;
    transition-duration: 300ms, 300ms;
    transition-delay: 150ms, 0ms;
    transition-timing-function: cubic-bezier(0.8, 0.01, 0.24, 1);
    cursor: move;

    &.minimized {
      max-width: 75px;
      max-height: 75px;
      min-height: 75px;
      border-radius: 75px;
      background-color: var(--v-warning-base);
    }
  }

  .content-wrapper {
    background-color: var(--clr-bg-alt);
    flex-grow: 1;

    overflow: hidden;

    max-width: 100%;
    width: 600px;
  }
  .content {
    overflow-y: auto;
  }

  .note {
    background-color: var(--v-terciary-base);
    padding: 0.4em;
    border-radius: 0.4em;
    font-size: 0.9rem;
  }
  .note-text {
    white-space: pre-line;
  }
  .metadata {
    font-size: 0.9em;
    opacity: 0.75;
    margin: 0;
    .metadata-name {
      cursor: pointer;
    }
  }

  .extra-info {
    position: fixed;
    font-size: 0.9rem;
    background-color: #fff;
    z-index: 999;
  }

  .profile-name {
    white-space: nowrap;
  }
  .load-more-wrapper {
    position: relative;
    overflow: hidden;
    &:after,
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      width: 100%;
      height: 1px;
      background-color: var(--v-terciary-darken3);
      opacity: 0.3;
    }
    &:after {
      left: 55%;
    }
    &:before {
      right: 55%;
    }
  }
  // .load-more-btn {
  // }
}

.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.theme--dark {
  .extra-info {
    background-color: var(--clr-bg-alt);
  }
}
</style>
