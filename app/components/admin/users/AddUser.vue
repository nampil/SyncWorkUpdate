<template>
  <v-dialog
    v-model="dialog"
    :overlay="false"
    persistent
    scrollable
    max-width="610px"
    transition="dialog-transition"
  >
    <v-card class="elevation-0">
      <v-toolbar color="secondary" dense>
        <v-btn icon dark @click="handleCancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="d-flex aling-center">
          <!-- <v-icon
            v-if="formTitle === 'New User' || formTitle === 'Nuevo Usuario'"
            class="mr-4"
            color="white"
            >mdi-account-plus</v-icon
          >
          <v-icon
            v-if="formTitle === 'Edit User' || formTitle === 'Editar Usuario'"
            class="mr-4"
            color="white"
            >mdi-pencil</v-icon
          > -->

          {{ formTitle }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            v-if="editedIndex === -1"
            ref="botonSave"
            text
            :loading="loading"
            @click="handleAddUser"
            >{{ $t('send') }}
          </v-btn>
          <v-btn
            v-else
            ref="botonUpdate"
            text
            :loading="loading"
            :disabled="validateForm"
            @click="handleUpdateUser('newUserForm')"
          >
            {{ $t('update') }}
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-container class="mt-3">
          <v-form ref="newUserForm">
            <v-row>
              <v-col cols="9">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="newUserName"
                      :label="$t('name') + ' *'"
                      outlined
                      hide-details="auto"
                      dense
                      :rules="nameRules"
                      @keydown.enter.exact.prevent
                      @keyup.enter.exact="handleFocus(3)"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      v-model="newUserLastName"
                      :label="$t('lastName') + ' *'"
                      outlined
                      hide-details="auto"
                      dense
                      :rules="lastNameRules"
                      @keydown.enter.exact.prevent
                      @keyup.enter.exact="handleFocus(5)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="7">
                    <v-text-field
                      v-model="newUserNickname"
                      :label="$t('nickname')"
                      outlined
                      hide-details="auto"
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col>
                    <v-checkbox
                      v-model="newUserDisabled"
                      :label="$t('disabledUser')"
                      dense
                      hide-details="auto"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="3">
                <v-avatar
                  color="secondary"
                  size="105"
                  style="overflow: visible"
                >
                  <v-icon
                    v-if="pictureAvatar === null || !pictureAvatar"
                    dark
                    large
                    class="ml-1"
                    color="primary"
                  >
                    mdi-account-circle</v-icon
                  >
                  <v-file-input
                    class="camera"
                    dense
                    hide-input
                    accept="image/png, image/jpeg, image/bmp"
                    prepend-icon="mdi-camera"
                    @change="handleInputFile($event, 'Avatar')"
                  ></v-file-input>

                  <img
                    v-if="pictureAvatar && pictureAvatar !== null"
                    :src="pictureAvatar.url"
                    style="object-fit: cover"
                  />
                  <v-btn
                    v-if="pictureAvatar && pictureAvatar !== null"
                    icon
                    small
                    class="delete-icon-avatar"
                    @click="handleDeletePic('Avatar')"
                  >
                    <v-icon color="error" small>mdi-close</v-icon>
                  </v-btn>
                </v-avatar>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="newUserEmail"
                  :label="$t('email') + ' *'"
                  outlined
                  hide-details="auto"
                  dense
                  :rules="emailRules"
                  @keydown.enter.exact.prevent
                  @keyup.enter.exact="handleFocus(7)"
                ></v-text-field>
              </v-col>
              <v-col v-if="editedIndex === -1" cols="6">
                <v-text-field
                  v-model="newUserPass"
                  :label="$t('password') + ' *'"
                  outlined
                  dense
                  hide-details="auto"
                  :rules="passwordRules"
                  :type="viewPass ? 'text' : 'password'"
                  :append-icon="viewPass ? 'mdi-lock' : 'mdi-eye'"
                  @keydown.enter.exact.prevent
                  @keyup.enter.exact="handleFocus(10)"
                  @click:append="viewPass = !viewPass"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="pt-5">
                <div class="divider-container text-center">
                  <span>{{ $t('selectAccessOption') }} *</span>
                </div>
              </v-col>

              <v-col cols="6">
                <div class="d-flex">
                  <v-checkbox
                    v-model="newUserAppAccess"
                    :label="$t('appAccess')"
                    dense
                    hide-details="auto"
                  ></v-checkbox>
                  <v-checkbox
                    v-model="newUserWebAccess"
                    class="ml-3"
                    :label="$t('webAccess')"
                    dense
                    hide-details="auto"
                  ></v-checkbox>
                </div>
              </v-col>

              <v-col cols="6">
                <v-autocomplete
                  v-model="newUserRol"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="rules"
                  :label="$t('role')"
                  :items="roles"
                  @change="handleFocusBtnActions()"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-slider
                  v-model="newUserAuthLevel"
                  :max="maxAuthLevel"
                  :tick-labels="newUserAuthLevels"
                  :disabled="!newUserRol"
                  step="1"
                  ticks="always"
                  hide-details="auto"
                  thumb-label
                  tick-size="1"
                  :thumb-size="24"
                  :label="$t('authLevel')"
                  @change="handleFocusBtnActions()"
                ></v-slider>
              </v-col>
              <v-col cols="12" class="pt-5">
                <div class="divider-container text-center">
                  <span>{{ $t('legalInformation') }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newUserCompanyName"
                  :label="$t('companyName')"
                  outlined
                  hide-details="auto"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="newUserDepartments"
                  :label="$t('departments')"
                  item-text="title"
                  item-value="title"
                  outlined
                  hide-details="auto"
                  multiple
                  dense
                  :rules="departmentsRules"
                  :items="departmentsTemplates"
                ></v-select>
              </v-col>

              <v-col cols="4">
                <v-combobox
                  v-model="newUserCodigo"
                  dense
                  outlined
                  clearable
                  :items="arrayCodigoPaises"
                  :rules="codigoRules"
                  hide-details="auto"
                  label="+ *"
                  @input="handleCodigoPais($event)"
                >
                </v-combobox>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="newUserPhoneNumber"
                  :label="$t('phoneNumber') + ' *'"
                  outlined
                  hide-details="auto"
                  :rules="phoneNumber"
                  dense
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="newUserAddress"
                  :label="$t('address') + ' *'"
                  outlined
                  :rules="address"
                  hide-details="auto"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <span class="body-1">{{ $t('documents') }}</span>
                <v-btn icon small>
                  <v-icon color="primary" @click="handleAddDocument()"
                    >mdi-plus-circle</v-icon
                  >
                </v-btn>

                <v-row v-for="(document, i) in documents" :key="i">
                  <v-col cols="11">
                    <v-select
                      v-model="document.documentType"
                      class="pt-4"
                      :items="typeDocuments"
                      outlined
                      hide-details="auto"
                      :rules="documentRules"
                      dense
                      clearable
                      :label="$t('addDocument') + ' *'"
                    ></v-select>
                  </v-col>
                  <v-col cols="1">
                    <v-btn
                      icon
                      class="delete-document"
                      @click="deleteDocument(i)"
                    >
                      <v-icon color="error">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>

                  <v-col v-if="document.documentType" cols="12">
                    <v-file-input
                      ref="document"
                      accept="image/png, image/jpeg, image/bmp, application/pdf"
                      prepend-icon="mdi-paperclip"
                      :label="$t('documentFile') + ' *'"
                      class="input-file"
                      outlined
                      hide-details="auto"
                      dense
                      truncate-length="30"
                      @change="
                        handleInputFile(
                          $event,
                          'Document',
                          i,
                          document.documentType
                        )
                      "
                    ></v-file-input>
                    <div class="previews pt-2">
                      <div
                        v-if="document.picture"
                        class="preview | text-center"
                      >
                        <img
                          v-if="
                            document.picture &&
                            document.picture.type &&
                            document.picture.type.includes('image')
                          "
                          :src="document.picture.url"
                          alt=""
                          class="imagen"
                          height="73px"
                          width="73px"
                        />
                        <div
                          v-if="
                            document.picture &&
                            document.picture.type &&
                            document.picture.type.includes('pdf')
                          "
                          class="file-preview | d-flex align-center justify-center"
                        >
                          <v-icon large>mdi-file-pdf-box</v-icon>
                        </div>
                        <v-btn
                          icon
                          class="delete-icon"
                          @click="handleDeletePic('Document', i)"
                        >
                          <v-icon color="error" small>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="newUserComment"
                  :label="$t('comments')"
                  auto-grow
                  hide-details="auto"
                  outlined
                  dense
                  rows="3"
                  row-height="30"
                ></v-textarea>
              </v-col>
              <v-col cols="12" class="pt-3"
                ><span class="info--text"> * {{ $t('required') }}</span>
              </v-col>

              <!--     <v-col col="12" class="text-right pt-4">
                <v-btn
                  color="error"
                  outlined
                  class="mr-4"
                  :disabled="loading"
                  @click="handleCancel()"
                  >{{ $t('cancel') }}</v-btn
                >
                <v-btn
                  v-if="
                    formTitle === 'New User' || formTitle === 'Nuevo Usuario'
                  "
                  ref="botonSave"
                  color="secondary"
                  :loading="loading"
                  :disabled="validateForm"
                  @click="handleAddUser"
                  >{{ $t('send') }}
                </v-btn>
                <v-btn
                  v-else
                  ref="botonUpdate"
                  color="secondary"
                  :loading="loading"
                  :disabled="validateForm"
                  @click="handleUpdateUser('newUserForm')"
                >
                  {{ $t('update') }}
                </v-btn>
              </v-col> -->
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import paises from '~/assets/paises'
export default {
  props: {
    show: { type: Boolean, default: false },
    formTitle: { type: String, default: '' },
    editedItem: { type: Object, default: () => ({}) },
    editedIndex: { type: Number, default: -1 },
    departmentsTemplates: { type: Array, default: () => [] },
  },
  data() {
    return {
      dialog: false,
      viewPass: false,
      roles: [
        { text: this.$t('admin'), value: 'admin' },
        { text: this.$t('contractor'), value: 'contractor' },
      ],
      rules: [(v) => !!v || this.$t('roleIsRequired')],
      nameRules: [(v) => !!v || this.$t('nameRequired')],
      lastNameRules: [(v) => !!v || this.$t('lastNameRequired')],
      emailRules: [
        (v) => !!v || this.$t('emailRequired'),
        (v) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          this.$t('emailValid'),
      ],
      passwordRules: [
        (v) => !!v || this.$t('passwordRequired'),
        (v) => /^(?=.*?[A-Z])/.test(v) || this.$t('passwordLeastUpperLetter'),
        (v) => /^(?=.*?[a-z])/.test(v) || this.$t('passwordLeastLowerLetter'),
        (v) => /^(?=.*?[0-9])/.test(v) || this.$t('passwordLeastDigit'),
        (v) =>
          /^(?=.*?[#?!@$%^&*-.])/.test(v) ||
          this.$t('passwordSpecialCharacter') + ' ' + '(#?!@$%^&*-.)',
        (v) => /^.{8,}/.test(v) || this.$t('passwordMinimumLength'),
      ],
      phoneNumber: [
        (v) => !!v || this.$t('phoneNumberIsRequired'),
        (v) => /^([0-9])*$/.test(v) || this.$t('onlyNumbers'),
      ],
      address: [(v) => !!v || this.$t('addressIsRequired')],
      codigoRules: [(v) => !!v || this.$t('countryCodeIsRequired')],
      newUserAuthLevels: [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
      ],
      departmentsRules: [(v) => !!v.length || 'Departments is Required'],
      documentRules: [(v) => !!v || this.$t('documentIsRequired')],
      newUserRol: null,
      newUserName: '',
      newUserLastName: '',
      newUserNickname: '',
      newUserEmail: '',
      newUserPass: '',
      newUserCompanyName: '',
      newUserDepartments: [],
      newUserPhoneNumber: null,
      newUserCodigo: '',
      newUserComment: '',
      newUserAddress: '',
      newUserAppAccess: false,
      newUserWebAccess: false,
      newUserAuthLevel: 0,
      newUserDisabled: false,
      pictureAvatar: null,
      fileAvatar: null,
      typeDocuments: ['License'],
      documents: [],
      userDocumentsBase: null,
      avatarBase: null,
      codigoPaises: null,
      arrayCodigoPaises: [],
      loading: false,
    }
  },

  computed: {
    maxAuthLevel() {
      if (!this.newUserRol) {
        return 10
      }
      let res = 10
      switch (this.newUserRol.value) {
        case 'admin':
          res = 10
          break
        case 'contractor':
          res = 2
          break

        default:
          res = 10
          break
      }
      return res
    },
    validateForm() {
      if (
        this.editedIndex === -1 &&
        (!this.newUserRol ||
          !this.newUserName ||
          !this.newUserLastName ||
          !this.newUserEmail ||
          !this.newUserPass ||
          !this.newUserAddress ||
          !this.newUserPhoneNumber ||
          !this.newUserCodigo ||
          !this.newUserDepartments.length ||
          (!this.newUserAppAccess && !this.newUserWebAccess))
      ) {
        return true
      } else if (
        this.editedIndex !== -1 &&
        this.newUserName === this.editedItem.name &&
        this.newUserLastName === this.editedItem.lastName &&
        this.newUserEmail === this.editedItem.email &&
        this.newUserPass === this.editedItem.password &&
        this.newUserAuthLevel === this.editedItem.customClaims.authLevel &&
        this.newUserRol === this.editedItem.customClaims.rol &&
        this.newUserNickname === this.editedItem.nickname &&
        this.newUserWebAccess === this.editedItem.customClaims.webAccess &&
        this.newUserAppAccess === this.editedItem.customClaims.appAccess &&
        this._.isEqual(this.pictureAvatar, this.editedItem.avatar) &&
        this._.isEqual(this.newUserDepartments, this.editedItem.departments) &&
        this.newUserDisabled === this.editedItem.disabled &&
        this.newUserCompanyName === this.editedItem.companyName &&
        this.newUserAddress === this.editedItem.address &&
        this.newUserComment === this.editedItem.comments &&
        `+${this.newUserCodigo} ${this.newUserPhoneNumber}` ===
          this.editedItem.phoneNumber &&
        this.validateDocuments
      ) {
        return true
      }
      return false
    },
    validateDocuments() {
      const picLocal = this.documents.map((d) => d.picture)
      const picBase = this.userDocumentsBase.map((d) => d.picture)
      return (
        this.userDocumentsBase.length === this.documents.length &&
        this._.isEqual(picLocal, picBase)
      )
    },
  },
  watch: {
    show(val) {
      this.dialog = val
      if (val) {
        this.clean()
      }
    },
    editedItem() {
      this.edited()
    },
  },
  mounted() {
    this.codigoPaises = paises.codigoPaises
    Object.keys(this.codigoPaises).forEach((key) => {
      this.arrayCodigoPaises.push(`${key} - ${this.codigoPaises[key]}`)
    })
  },

  methods: {
    clean() {
      if (this.$refs.newUserForm) {
        this.$refs.newUserForm.reset()
      }
      this.pictureAvatar = null
      this.resetDocuments()
    },
    async handleAddUser() {
      if (!this.$refs.newUserForm.validate()) {
        return
      }

      this.loading = true
      try {
        const objectToSend = {
          authLevel: this.newUserAuthLevel,
          email: this.newUserEmail,
          displayName: `${this.newUserName} ${this.newUserLastName}`,
          password: this.newUserPass,
          name: this.newUserName,
          lastName: this.newUserLastName,
          rol: this.newUserRol,

          nickname: this.newUserNickname,
          companyName:
            this.newUserCompanyName === null ? '' : this.newUserCompanyName,
          departments: this.newUserDepartments || [],
          phoneNumber: `+${this.newUserCodigo} ${this.newUserPhoneNumber}`,
          comments: this.newUserComment === null ? '' : this.newUserComment,
          address: this.newUserAddress,
          appAccess: this.newUserAppAccess || false,
          webAccess: this.newUserWebAccess || false,
          disabled: !!this.newUserDisabled,
          fileAvatar: this.fileAvatar,
          avatar: this.pictureAvatar,
          filesDocuments: this.documents.length
            ? this.documents.map((d) => d.file)
            : [],
          userDocuments: this.documents.length
            ? this.documents.map((d) => d.picture)
            : [],
        }

        await this.$store.dispatch('admin/users/add_new_user', {
          objectToSend,
        })
        this.handleCancel()
        this.$mainAlertSuccess(this.$t('successUser'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('embarrassingError'))
      } finally {
        this.loading = false
      }
    },
    async handleUpdateUser(formRef) {
      if (!this.$refs[formRef].validate()) {
        return
      }

      this.loading = true

      try {
        const _filesDocuments =
          this.documents && this.documents.map((d) => d.file)
            ? this.documents.map((d) => d.file).filter((f) => f !== null)
            : null

        const objectToSend = {
          authLevel: this.newUserAuthLevel,
          email: this.newUserEmail || this.editedItem.email,
          name: this.newUserName,
          lastName: this.newUserLastName,
          displayName: `${this.newUserName} ${this.newUserLastName}`,
          rol: this.newUserRol,
          uid: this.uid,
          nickname: this.newUserNickname,
          companyName:
            this.newUserCompanyName === null ? '' : this.newUserCompanyName,
          departments: this.newUserDepartments || [],
          phoneNumber: `+${this.newUserCodigo} ${this.newUserPhoneNumber}`,
          comments: this.newUserComment,
          address: this.newUserAddress,
          appAccess: !!this.newUserAppAccess,
          webAccess: !!this.newUserWebAccess,
          disabled: !!this.newUserDisabled,
          fileAvatar: this.fileAvatar,

          avatar: this.pictureAvatar,

          avatarBase: this.avatarBase,
          filesDocuments: _filesDocuments,
          userDocuments: this.documents.length
            ? this.documents.map((d) => d.picture)
            : [],
          userDocumentsBase: this.documents.length
            ? this.userDocumentsBase.map((d) => d.picture)
            : [],
        }

        await this.$store.dispatch('admin/users/update_user', {
          objectToSend,
          type: 'update',
        })
        this.$mainAlertSuccess(this.$t('successUpdate'))
        this.handleCancel()
      } catch (error) {
        // eslint-disable-next-line
        console.log(error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    handleInputFile(file, typeFile, index, documentType) {
      if (!file) {
        return
      }
      const codeName =
        new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)
      file.codeName = codeName
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target.result
        if (typeFile === 'Document') {
          this.documents[index].picture = {
            url,
            type: file.type,
            codeName: file.codeName,
            documentType,
          }
          file.documentType = documentType
          this.documents[index].file = file
        }
        if (typeFile === 'Avatar') {
          this.pictureAvatar = {
            url,
            type: file.type,
            codeName: file.codeName,
          }
          this.fileAvatar = file
        }
      }
      reader.readAsDataURL(file)
    },
    handleDeletePic(typePic, index) {
      if (typePic === 'Avatar') {
        this.pictureAvatar = null
        this.fileAvatar = null
      }
      if (typePic === 'Document') {
        this.documents[index].picture = null
        this.documents[index].file = null
        this.$refs.document[index].reset()
      }
    },
    handleCodigoPais(event) {
      if (!event || !event.length) {
        return
      }

      const indexOfAT = event.slice(0).lastIndexOf('-')
      if (indexOfAT !== -1) {
        const textToReplace = event.slice(indexOfAT + 2)
        this.$nextTick(() => {
          this.newUserCodigo = textToReplace
        })
      }
    },
    handleAddDocument() {
      this.documents.push({
        documentType: '',
        file: null,
        picture: null,
      })
    },
    deleteDocument(index) {
      this.documents.splice(index, 1)
    },

    handleCancel() {
      if (this.$refs.newUserForm) {
        this.$refs.newUserForm.reset()
      }
      this.fileAvatar = null
      this.pictureAvatar = null
      this.resetDocuments()
      /* this.close() */
      this.$emit('close')
    },
    resetDocuments() {
      if (this.$refs.document) {
        for (let index = 0; index < this.$refs.document.length; index++) {
          const form = this.$refs.document[index]
          form.reset()
        }
        this.documents = []
      }
    },

    handleFocus(index) {
      this.$nextTick(() => {
        this.$refs.newUserForm.$el[index].focus()
      })
    },
    handleFocusBtnActions() {
      if (!this.dialog) {
        return
      }
      setTimeout(() => {
        if (this.editedIndex === -1) {
          this.$refs.botonSave.$el.focus()
        } else if (this.editedIndex !== -1) {
          this.$refs.botonUpdate.$el.focus()
        }
      }, 200)
    },
    edited() {
      this.uid = this.editedItem.uid
      this.newUserAuthLevel = this.editedItem.customClaims
        ? this.editedItem.customClaims.authLevel
        : 0
      this.newUserRol = this.editedItem.customClaims
        ? this.editedItem.customClaims.rol
        : null
      this.newUserDepartments = this.editedItem.departments || []
      this.newUserName = this.editedItem.name
      this.newUserLastName = this.editedItem.lastName
      this.newUserEmail = this.editedItem.email
      this.newUserPass = this.editedItem.password
      this.newUserNickname = this.editedItem.nickname
      this.pictureAvatar = this.editedItem.avatar
        ? this.editedItem.avatar
        : null
      this.avatarBase = JSON.parse(JSON.stringify(this.pictureAvatar))
      this.newUserWebAccess = this.editedItem.customClaims
        ? this.editedItem.customClaims.webAccess
        : false
      this.newUserAppAccess = this.editedItem.customClaims
        ? this.editedItem.customClaims.appAccess
        : false
      // Datos de la collection admin/profile
      const _phoneNumber = this.editedItem.phoneNumber
        ? this.editedItem.phoneNumber.split(' ')
        : []
      this.newUserDisabled = this.editedItem.disabled
      this.newUserCompanyName = this.editedItem
        ? this.editedItem.companyName
        : ''
      this.newUserAddress = this.editedItem ? this.editedItem.address : ''
      this.newUserComment = this.editedItem ? this.editedItem.comments : ''
      this.newUserCodigo = _phoneNumber[0] ? parseInt(_phoneNumber[0]) : null

      this.newUserPhoneNumber = _phoneNumber[1]
        ? parseInt(_phoneNumber[1])
        : null
      const _documents = []
      if (
        this.editedItem.userDocuments &&
        this.editedItem.userDocuments.length
      ) {
        this.editedItem.userDocuments.forEach((doc) => {
          const dataDocuments = {
            documentType: doc.documentType,
            picture: {
              codeName: doc.codeName,
              name: doc.name,
              type: doc.type,
              url: doc.url,
              documentType: doc.documentType,
            },
            file: null,
          }
          _documents.push(dataDocuments)
        })
      }
      this.documents = _documents && _documents.length ? _documents : []
      this.userDocumentsBase = JSON.parse(JSON.stringify(this.documents))
    },
  },
}
</script>

<style lang="scss" scoped>
.dialog {
  overflow: hidden;
}
.camera {
  position: absolute;
  bottom: 4px;
  right: 0;
  border-radius: 100%;
  z-index: 1;
}
.delete-icon-avatar {
  position: absolute;
  top: 5px;
  border-radius: 100%;
  right: 6px;
  z-index: 1;
}
.previews {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  .file-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .preview,
  .file-preview {
    width: 110px;
    height: 73px;
    position: relative;
    .imagen {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: 4px;
    }
    .delete-icon {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}
.divider-container {
  position: relative;
  margin-inline: auto;
  width: 150px;
}
.divider-container::after,
.divider-container::before {
  content: '';
  position: absolute;
  height: 1px;
  width: 210px;
  background-color: #9b9b9bc8;
}
.divider-container::after {
  right: 100%;
  top: 50%;
}
.divider-container::before {
  left: 100%;
  top: 50%;
}
.delete-document {
  margin: 18px 0 0 -10px;
}
.v-enter-active,
.v-leave-active {
  transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
}
.v-enter,
.v-leave-to {
  opacity: 0;
  transform: translateX(20%);
}
</style>
