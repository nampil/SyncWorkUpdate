<template>
  <div class="chat-form">
    <v-form
      ref="formGroup"
      class="form-group | d-flex align-center px-4 py-2 gap-12"
    >
      <div class="form-content | py-4 flex-grow-1">
        <transition>
          <div v-if="!showVoiceNote" class="form-inputs | d-flex align-center">
            <div class="d-flex align-center">
              <v-file-input
                ref="inputFile"
                class="input-file | mt-0 mr-2"
                accept="image/png, image/jpeg, image/bmp, application/pdf, audio/mpeg"
                prepend-icon="mdi-paperclip"
                label="file"
                hide-details="auto"
                dense
                hide-input
                multiple
                @click="$event.target.value = ''"
                @change="handleInputFiles"
              ></v-file-input>

              <v-btn icon class="mr-2" @click="handleEmoticones">
                <v-icon> mdi-emoticon-happy-outline </v-icon>
              </v-btn>
            </div>

            <div
              ref="chatFormTextArea"
              contenteditable
              class="container-editable"
              @keydown.enter.exact.prevent
              @keyup.enter.exact="sendMessage"
              @paste="handleFilesPaste($event)"
              @input="handleTextInput($event.target.innerText)"
              @blur="handlePosition"
            ></div>
          </div>

          <add-voice-note
            v-else
            class="add-voice-note"
            :voice-note-url="voiceNotePreviewUrl"
            :recording="recording"
            @delete-audio="deleteAudio()"
          />
        </transition>
      </div>

      <v-btn
        v-if="message || filePreview.length || voiceNotePreviewUrl !== ''"
        ref="btnSend"
        :disabled="
          !message && filePreview.length === 0 && voiceNotePreviewUrl === ''
        "
        icon
        large
        :loading="loading"
        @keyup.enter.exact="sendMessage"
        @click="sendMessage"
      >
        <v-icon class="icon-send" large color="primary">mdi-send</v-icon>
      </v-btn>

      <v-btn
        v-else
        icon
        large
        :loading="loading"
        @mousedown="handleVoiceNote"
        @mouseup="stopVoiceNote"
        @mouseleave="stopVoiceNote"
      >
        <v-icon :color="recording ? 'error' : 'primary'">mdi-microphone</v-icon>
      </v-btn>
    </v-form>

    <transition>
      <div
        v-show="showEmoticones"
        class="emoticones flex-column overflow-hidden"
      >
        <v-tabs v-model="tab" background-color="transparent">
          <v-tab v-for="(item, i) in items" :key="i" class="tab-emoticones">
            {{ item }}
          </v-tab>
        </v-tabs>

        <section
          v-for="(section, i) in arrayEmojis"
          :key="i"
          class="flex-grow-1 overflow-y-auto"
        >
          <div v-if="i == tab" class="emojis | d-flex justify-center pa-2">
            <div
              v-for="(emoji, title) in section"
              :key="title"
              class="cursor text-center"
              @click.stop="handleAddEmoji(emoji)"
            >
              <span>{{ emoji }}</span>
            </div>
          </div>
        </section>
      </div>
    </transition>

    <transition>
      <div v-show="showUsersToTag" class="container-users">
        <v-card
          class="elevation-0 overflow-y-auto d-flex flex-column flex-grow-1"
        >
          <v-list-item
            v-for="user in usersListFormatted"
            :key="user.id"
            class="active-list"
            @click="handleUserTag(user)"
          >
            <v-avatar size="35" color="primary" class="mr-4 ml-2">
              <img
                v-if="user.avatar"
                alt="Avatar"
                :src="user.avatar.url"
                class="img"
              />

              <span
                v-else-if="user.name && user.lastName"
                class="white--text text-h8"
                >{{ user.name.charAt(0) + user.lastName.charAt(0) }}</span
              >
            </v-avatar>

            <span class="ml-2 mt-0">{{ user.fullName }}</span>
            <v-spacer></v-spacer>
          </v-list-item>

          <span
            v-if="!usersListFormatted.length"
            class="info--text d-flex justify-center mt-2"
            >{{ $t('userNotFound!') }}</span
          >
        </v-card>
      </div>
    </transition>

    <transition>
      <div v-show="preview">
        <div class="preview | d-flex flex-column">
          <div class="d-flex justify-end">
            <v-btn icon @click="closePreview">
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </div>
          <div class="preview-content || flex-grow-1 pa-4">
            <div class="h-100 d-flex flex-wrap gap-12">
              <div
                v-for="(file, i) in filePreview"
                :key="i"
                class="preview-item"
              >
                <v-btn
                  class="closeBtn"
                  icon
                  small
                  @click="deleteFile(file.codeName)"
                >
                  <v-icon color="error" small>mdi-delete</v-icon>
                </v-btn>
                <img
                  v-if="file.type.includes('image')"
                  :src="file.url"
                  class="imgPreview"
                  @click="handlerShowImagesSlides(file.codeName)"
                />
                <div
                  v-if="file.type.includes('pdf')"
                  class="file-preview d-flex align-center justify-center"
                  @click="handleViewPdf(file.url)"
                >
                  <v-icon size="60">mdi-file</v-icon>
                </div>
                <add-audio
                  v-if="file.type.includes('audio')"
                  :url="file.url"
                  class="file-preview-audio"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <slide-show
      :list="listImg"
      :index-selected="indexOfImage"
      :show="showImagesSlides"
      :title="$t('ImagesView')"
      type="images"
      @close="showImagesSlides = false"
    />
    <v-dialog v-model="showPdfViewer" fullscreen>
      <pdf-viewer :url="previewUrl" @close="handleClosePdfViewer"></pdf-viewer>
    </v-dialog>
  </div>
</template>

<script>
import fixWebmDuration from 'fix-webm-duration'
import { mapState } from 'vuex'
import emojisAssets from '../../assets/emojis.js'
import SlideShow from '../misc/SlideShow.vue'
import PdfViewer from '../misc/PdfViewer.vue'
import AddAudio from './audio/AddAudio.vue'
import AddVoiceNote from './audio/AddVoiceNote.vue'
import { MEDIA_TYPES } from '~/utils/dictionaries'

function getCaretPosition(editableDiv) {
  editableDiv.focus()
  const _range = document.getSelection().getRangeAt(0)
  const range = _range.cloneRange()
  range.selectNodeContents(editableDiv)
  range.setEnd(_range.endContainer, _range.endOffset)
  return range.toString().length
}
function setEndOfContenteditable(contentEditableElement, lastIndexForTag) {
  let range, selection
  if (document.createRange) {
    range = document.createRange()
    range.setStart(contentEditableElement.childNodes[lastIndexForTag + 1], 1)
    range.collapse(true)
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  } else if (document.selection) {
    range = document.body.createTextRange()
    range.moveToElementText(contentEditableElement)
    range.collapse(false)
    range.select()
  }
}

export default {
  name: 'ChatForm',
  components: {
    AddAudio,
    AddVoiceNote,
    SlideShow,
    PdfViewer,
  },
  props: {
    resetForm: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      label: 'Message',
      tab: null,
      arrayEmojis: [],
      items: [],
      message: '',
      emojis: null,
      showEmoticones: false,
      filePreview: [],
      filesForSend: [],
      showUsersToTag: false,
      preview: false,
      taggedUsers: [],
      subscribersList: [],
      currentCursorPosition: 0,
      showVoiceNote: false,
      recorder: null,
      voiceNotePreviewUrl: '',
      blobVoice: null,
      recording: false,
      pressedAt: 0,
      showImagesSlides: false,
      listImg: [],
      indexOfImage: 0,
      previewUrl: '',
      showPdfViewer: false,
    }
  },
  computed: {
    ...mapState({
      users: (state) => state.chats.users,
      chatRooms: (state) => state.chats.chatRooms,
    }),
    usersListFormatted() {
      const taggedUsersUid = this.taggedUsers.map((t) => t.uid)
      if (this.roomSelected && this.subscribersList) {
        return this.subscribersList.filter((sub) => {
          return (
            !this.users.includes(sub.uid) && !taggedUsersUid.includes(sub.uid)
          )
        })
      }
      return []
    },
    roomSelected() {
      return this.$store.state.chats.roomSelected
    },
    roomSelectedFormatted() {
      if (!this.roomSelected) {
        return null
      }
      const indexOfRoomSelected = this.chatRooms.findIndex(
        (chatRoom) => chatRoom.id === this.roomSelected
      )
      const _roomSelected = this.chatRooms[indexOfRoomSelected]

      if (!_roomSelected) {
        return null
      }
      const subscribers = _roomSelected.subscribers.filter(
        (sub) => sub.name && sub.lastName
      )
      return {
        ..._roomSelected,
        ...(_roomSelected.isOrderChat && { name: `WO#${_roomSelected.name}` }),
        subscribers,
        chats: _roomSelected.chats
          .map((c) => c)
          .sort((a, b) => {
            return a.createdAt.getTime() > b.createdAt.getTime() ? 1 : -1
          }),
      }
    },
  },
  watch: {
    resetForm(value) {
      if (value) {
        this.handleResetForm()
      }
    },
    roomSelected(val) {
      this.handleResetForm()
      if (val.subscribers) {
        this.subscribersList = val.subscribers
      }
    },
    message(newVal) {
      this.$nextTick(() => {
        if (this.taggedUsers.length > 0) {
          const removetaggedUsers = []
          this.taggedUsers.forEach((user) => {
            if (!newVal.includes(`@${user.name}`)) {
              removetaggedUsers.push(user)
            }
          })
          const chatTextArea = this.$refs.chatFormTextArea
          if (removetaggedUsers.length) {
            removetaggedUsers.forEach((tUser) => {
              const span = document.getElementById(`tag_${tUser.name}`)

              if (span) {
                const chatFormTextArea = this.$refs.chatFormTextArea
                const cursorPosition = getCaretPosition(chatFormTextArea)

                const indexOfM = this.message
                  .slice(0, cursorPosition)
                  .lastIndexOf('@')

                const textToReplace = this.message.slice(
                  indexOfM,
                  cursorPosition
                )
                const textReplaced = this.message
                  .slice(indexOfM, cursorPosition)
                  .replace(textToReplace, '')
                this.message =
                  this.message.slice(0, indexOfM) +
                  textReplaced +
                  this.message.slice(cursorPosition)

                chatTextArea.removeChild(span)
              }
            })
            this.taggedUsers = this.taggedUsers.filter(
              (user) => !removetaggedUsers.includes(user)
            )
          }
        }
      })
    },
  },
  mounted() {
    this.emojis = emojisAssets
    Object.keys(this.emojis).forEach((key) => {
      this.items.push(key)
      this.arrayEmojis.push(this.emojis[key])
    })
  },

  methods: {
    handlePosition() {
      const chatFormTextArea = this.$refs.chatFormTextArea

      // this.currentCursorPosition = getCaretPosition(chatFormTextArea)

      chatFormTextArea.blur()
    },
    handleAddEmoji(emoji) {
      if (!emoji) return
      const textStart = this.message.slice(0, this.currentCursorPosition)
      const textEnd = this.message.slice(this.currentCursorPosition)
      this.message =
        textStart + `<span id='emoji'>${emoji}</span>` + '&nbsp' + textEnd
      this.handleFormattedString(this.message)
    },

    sendMessage() {
      if (
        !this.message.trim() &&
        this.filePreview.length === 0 &&
        this.voiceNotePreviewUrl === ''
      ) {
        return
      }
      const file = new File([this.blobVoice], 'Voice note', {
        type: 'audio/webm',
      })
      if (this.voiceNotePreviewUrl !== '') {
        file.codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        this.filesForSend.push(file)
      }
      this.$emit('send-message', {
        msg: this.message,
        attachmentFiles: this.filesForSend,
        taggedUsers: this.taggedUsers.map((t) => t.uid),
      })
      this.handleResetForm()
    },

    handleUserTag(user) {
      if (!user || this.taggedUsers.includes(user.uid)) return
      this.showUsersToTag = false
      const chatFormTextArea = this.$refs.chatFormTextArea
      const cursorPosition = getCaretPosition(chatFormTextArea)
      const indexOfAT = this.message.slice(0, cursorPosition).lastIndexOf('@')
      this.taggedUsers.push(user)
      const textToReplace = this.message.slice(indexOfAT, cursorPosition)
      const textReplaced = this.message
        .slice(indexOfAT, cursorPosition)
        .replace(textToReplace, `@${user.name}` + '&nbsp')
      this.message =
        this.message.slice(0, indexOfAT) +
        textReplaced +
        this.message.slice(cursorPosition)
      this.handleFormattedString(this.message, user.name)
    },

    handleFormattedString(mainText, userDa) {
      let _msg = mainText
      if (this.taggedUsers.length > 0) {
        this.taggedUsers.forEach((user) => {
          if (_msg.includes(`@${user.name}`)) {
            const newSpan =
              `<span class='taggedForm' style="color: var(--v-tagged-base)" id='tag_${user.name}'  contenteditable='false'  >@` +
              user.name +
              '</span>'
            _msg = _msg.replace('@' + user.name, newSpan)
          }
        })
      }

      const chatFormTextArea = this.$refs.chatFormTextArea
      chatFormTextArea.innerHTML = _msg
      this.message = `${chatFormTextArea.innerText.trim()} `

      let lastIndexForTag
      chatFormTextArea.childNodes.forEach((e, i) => {
        if (e.id && userDa && 'tag_' + userDa === e.id) {
          lastIndexForTag = i
        }
        if (e.id && e.id === 'emoji') {
          lastIndexForTag = i
        }
      })
      this.$nextTick(() => {
        setEndOfContenteditable(chatFormTextArea, lastIndexForTag)
      })
    },
    handleTextInput(text) {
      this.message = text
      const chatFormTextArea = this.$refs.chatFormTextArea
      const positionCursor = getCaretPosition(chatFormTextArea)
      const index = text.slice(0, positionCursor).lastIndexOf('@')
      const textSeach = text.slice(index, positionCursor)
      const indexOfAT = textSeach.lastIndexOf('@')
      if (indexOfAT === -1) {
        this.showUsersToTag = false
        return
      }
      const searchRaw = indexOfAT > -1 ? textSeach.slice(indexOfAT + 1) : ''
      const search = searchRaw.toLowerCase()

      if (
        this.roomSelectedFormatted &&
        this.roomSelectedFormatted.isGroup &&
        this.roomSelectedFormatted.subscribers &&
        this.roomSelectedFormatted.subscribers.length &&
        indexOfAT > -1 &&
        !/\s/.test(searchRaw) &&
        !this.roomSelectedFormatted.subscribers.some((e) =>
          searchRaw.includes(e.name)
        )
      ) {
        if (!search) {
          this.subscribersList = this.roomSelectedFormatted.subscribers
          this.showUsersToTag = false
        } else {
          this.subscribersList = this.roomSelectedFormatted.subscribers.filter(
            (user) => {
              return user.fullName.toLowerCase().includes(search)
            }
          )
        }
        this.showUsersToTag = true
      } else {
        this.showUsersToTag = false
      }
    },

    closePreview() {
      this.$refs.formGroup.reset()
      const inputFile = this.$refs.inputFile
      this.$nextTick(() => {
        this.preview = false
        this.filePreview = []
        this.filesForSend = []
        inputFile.reset()
      })
    },
    handleResetForm() {
      this.showEmoticones = false
      this.showUsersToTag = false
      this.preview = false
      this.message = ''
      this.filePreview = []
      this.filesForSend = []
      this.taggedUsers = []
      this.subscribersList = []
      this.$emit('form-resetted')
      if (this.$refs.chatFormTextArea) {
        this.$refs.chatFormTextArea.innerHTML = ''
      }
      this.deleteAudio()
    },
    handleEmoticones() {
      this.showEmoticones = !this.showEmoticones
      if (this.showEmoticones) {
        this.showUsersToTag = false
      }
    },
    deleteFile(codeName) {
      const indexToDeleteInFilesForSend = this.filesForSend.findIndex(
        (_file) => _file.codeName === codeName
      )
      const indexToDeleteInFilePreview = this.filePreview.findIndex(
        (_file) => _file.codeName === codeName
      )

      this.filePreview.splice(indexToDeleteInFilePreview, 1)
      this.filesForSend.splice(indexToDeleteInFilesForSend, 1)

      if (this.filePreview.length === 0) {
        this.preview = false
      }
    },
    handleFilesPaste(event) {
      const _items = event.clipboardData.items
      const files = []
      if (!_items.length) {
        return
      }
      for (let i = 0; i < _items.length; i++) {
        const item = _items[i]
        if (item?.kind === 'file') {
          event.preventDefault()
          const file = item.getAsFile()
          files.push(file)
        }
      }
      this.handleInputFiles(files)
    },
    handleInputFiles(files) {
      if (!files || !files.length) {
        return
      }
      if (files.length > 6 || files.length + this.filePreview.length > 6) {
        this.$mainAlertError(this.$t('oopsProblemImageChat'))
        return
      }
      files.forEach((file) => {
        if (!file) {
          return
        }
        if (this.filePreview.length >= 6) {
          this.$mainAlertError(this.$t('oopsProblemImageChat'))
          return
        }
        const indexOfFile = this.filesForSend.findIndex(
          (_file) => _file.name === file.name
        )
        if (indexOfFile > -1) {
          return
        }

        this.filesForSend.unshift(file)
        const codeName =
          new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
        file.codeName = codeName
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target.result

          if (indexOfFile === -1) {
            this.filePreview.unshift({
              url,
              type: file.type,
              codeName: file.codeName,
              name: file.name,
            })
          }
        }
        reader.readAsDataURL(file)
      })
      this.preview = true
      this.showEmoticones = false
      this.showUsersToTag = false
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
      this.filesForSend = []
    },
    handlerShowImagesSlides(codeName) {
      this.showImagesSlides = true
      this.listImg = this.filePreview.filter((pic) =>
        pic.type.includes(MEDIA_TYPES.image)
      )
      this.indexOfImage = this.listImg.findIndex((c) => c.codeName === codeName)
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
.chat-form {
  position: relative;
  isolation: isolate;
  background-color: var(--clr-bg-alt);
}
.form-group {
  display: grid;
  grid-template-columns: 1fr auto;
  position: relative;
  z-index: 1;
  background-color: var(--clr-bg-alt);
}
.form-content {
  position: relative;
}
.form-inputs,
.add-voice-note {
  grid-column: 1 / 2;
}
.emoticones,
.container-users {
  position: absolute;
  left: 0;
  width: 100%;
  height: 188px;
  bottom: 100%;
  display: flex;
  overflow-x: hidden;
  z-index: -1;
  background-color: var(--clr-bg-alt);
}
.emoticones::-webkit-scrollbar {
  width: 4px;
}
.emoticones::-webkit-scrollbar-thumb {
  background: #f5f5f5;
}
.tab-emoticones {
  font-size: 12px;
  margin-left: 23px;
}
.emojis {
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  width: 100%;
}
.preview {
  position: absolute;
  top: -188px;
  z-index: 5;
  left: 0;
  width: 100%;
  height: 188px;
  overflow-x: hidden;
  background-color: #f5f5f5;
}
.preview::-webkit-scrollbar {
  display: none; /* Chrome */
}
.cursor {
  cursor: pointer;
  width: 7%;
}
.preview-content {
  overflow-y: auto;
}
.preview-item {
  position: relative;
  .closeBtn {
    position: absolute;
    top: 4px;
    right: 4px;
  }
  img {
    object-fit: cover;
    display: block;
  }
}
.imgPreview,
.file-preview,
.file-preview-audio {
  width: 100px;
  aspect-ratio: 1.2/1;
  border: 2px solid #ddd;
  border-radius: 4px;
}
.input-file ::v-deep .v-input__prepend-outer {
  margin: 0;
  padding: 4px;
  transform: rotate(45deg);
}
.icon-send {
  margin-bottom: 8px;
  transform: rotate(-45deg);
}
.container-editable {
  padding: 0.45rem 0.75rem;
  width: 100%;
  border: 1px solid #04040444;
  border-radius: 20px;
  outline: none;
  &:focus-visible {
    border: 1px solid var(--v-primary-base);
  }
}
div[contenteditable]:empty:focus::before,
div[contenteditable]:empty::before {
  content: 'Write a message...';
  color: rgba(0, 0, 0, 0.522);
}
.container-voice-note {
  padding: 0.58rem 0.75rem;
  margin-right: 10px;
  width: 100%;
  border: 1px solid var(--v-primary-base);
  border-radius: 20px;
  outline: none;
}
.v-enter-active,
.v-leave-active {
  transition: all 0.25s;
}
.v-enter, .v-leave-to /* .fade-leave-active below version 2.1.8 */ {
  translate: 0 100%;
  opacity: 0;
  width: 100%;
  position: absolute;
}
.theme--dark {
  .preview {
    background-color: #1b1d1e;
  }
  .emoticones,
  .container-users {
    background-color: var(--clr-bg-alt);
  }
  .container-editable {
    border: 1px solid #d1d4d7;
    &:focus-visible {
      border: 1px solid var(--v-primary-base);
    }
  }
  div[contenteditable]:empty:focus::before,
  div[contenteditable]:empty::before {
    color: rgba(255, 255, 255, 0.522);
  }
}
</style>
