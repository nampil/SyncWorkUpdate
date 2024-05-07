<template>
  <v-card class="elevation-0">
    <v-toolbar color="primary" dense>
      <v-toolbar-title class="d-flex aling-center">
        <v-icon class="mr-4" color="white">mdi-clipboard-edit</v-icon>

        <span class="ma-0 text-h5 white--text"
          >{{ $t('editGroup') }}
        </span></v-toolbar-title
      >
    </v-toolbar>
    <v-card-text class="pt-7 pb-5 text-center">
      <div class="d-flex flex-row">
        <v-avatar
          color="accent"
          size="45"
          style="overflow: visible"
          class="ma-3 ml-0"
        >
          <v-btn
            v-if="newChatGroup.image != null"
            icon
            x-small
            class="btn-delete"
            @click="handleDeleteFile"
          >
            <v-icon color="red" x-small>mdi-close-circle-outline</v-icon></v-btn
          >
          <v-form ref="avatarForm">
            <v-file-input
              v-model="newChatGroup.file"
              class="camera"
              dense
              hide-input
              :rules="rules"
              accept="image/png, image/jpeg, image/bmp"
              prepend-icon="mdi-camera"
              @change="handleInputFiles($event, 'avatarForm')"
            ></v-file-input>
          </v-form>
          <img
            v-if="newChatGroup.image != null"
            :src="newChatGroup.image"
            style="object-fit: cover"
          />
        </v-avatar>

        <v-form ref="groupName">
          <v-text-field
            v-model="newChatGroup.name"
            class="ml-0 mt-6"
            :label="$t('groupName')"
            :rules="nameRules"
            dense
            hide-details="auto"
            required
          ></v-text-field>
        </v-form>
      </div>
      <v-divider></v-divider>
    </v-card-text>

    <v-card-actions class="d-flex justify-end pa-4 pt-0">
      <v-btn
        class="mr-4"
        color="error"
        dense
        outlined
        :disabled="loading"
        @click="closeEdit()"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn
        class="mr-4"
        dense
        color="secondary"
        :loading="loading"
        @click="updateGroup('groupName')"
        >{{ $t('save') }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: {
    chatgroupname: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      dialogEdit: false,
      nameRules: [(v) => !!v || this.$t('groupNameRequired')],
      rules: [
        (value) => !value || value.size < 2000000 || this.$t('avatarRequired'),
      ],
      loading: false,
      newChatGroup: {},
      deleteAvatarId: '',
    }
  },
  computed: {
    roomSelected: {
      get() {
        return this.$store.state.chats.roomSelected
      },
      set(val) {
        this.$store.commit('chats/set_roomSelected', val)
      },
    },
  },

  mounted() {
    this.newChatGroup = JSON.parse(JSON.stringify(this.chatgroupname))
  },
  methods: {
    async updateGroup(ref) {
      this.loading = true
      if (!this.$refs[ref].validate()) {
        this.loading = false
        return
      }

      try {
        const updateGroup = {
          name: this.newChatGroup.name,
          file: this.newChatGroup.file,
          chatRoomId: this.roomSelected,
          deleteAvatarId: this.deleteAvatarId,
          urlDelete: this.chatgroupname.image,
        }
        await this.$store.dispatch('chats/update_group', {
          updateGroup,
        })

        this.loading = false
        this.closeEdit()
        this.reset(ref)
        this.$mainAlertSuccess(this.$t('successGroupUpdate'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error-code: ', error)
        this.loading = false
        this.closeEdit()
        this.$mainAlertError(this.$t('embarrassingError'))
      }
    },
    handleInputFiles(file, ref) {
      if (!this.$refs[ref].validate()) {
        return
      }
      this.newChatGroup.image = URL.createObjectURL(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target.result
        this.avatar = {
          url,
          type: file.type,
        }
      }
      reader.readAsDataURL(file)
    },
    closeEdit() {
      this.dialogEdit = false
      this.$emit('close')
      this.reset()
    },
    reset() {
      if (this.$refs.avatarForm) {
        this.$refs.avatarForm.resetValidation()
      }

      this.$refs.groupName.reset()
      this.newChatGroup.name = ''
      this.newChatGroup.file = null
      this.newChatGroup.image = null
      this.deleteAvatarId = ''
    },
    handleDeleteFile() {
      this.newChatGroup.file = null
      this.newChatGroup.image = null
      this.deleteAvatarId = this.newChatGroup.imageId
    },
  },
}
</script>
<style lang="scss" scoped>
.camera {
  position: absolute;
  right: 0;
  z-index: 10;
  margin: -1rem 0.1rem 0 0;
}
.img {
  object-fit: cover;
}
.btn-delete {
  position: absolute;
  bottom: 1.8rem;
  left: 2.2rem;
}
</style>
