<template>
  <v-card scrollable>
    <v-toolbar color="secondary" dense class="flex-grow-0">
      <v-btn
        icon
        class="mr-4"
        :disabled="loading"
        @click="$emit('close', null)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-icon color="white" class="ml-4 mr-4">mdi-content-duplicate</v-icon>
      <v-toolbar-title class="d-flex aling-center">
        Apply Autocomplete to Requirement</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          ref="botonUpdate"
          text
          :loading="loading"
          @click="applyAutocomplete()"
          >Apply</v-btn
        >
      </v-toolbar-items>
    </v-toolbar>

    <v-card-text class="card-text | pt-4">
      <p v-if="!requirements">No Requirement</p>
      <v-form>
        <v-row>
          <v-col cols="6">
            <v-text-field
              ref="autocompleteStartFromInput"
              v-model="startFromAutocomplete"
              label="Start at"
              reverse
              type="number"
              min="1"
              step="1"
              hide-spin-buttons
              dense
              outlined
              hide-details
              :rules="rules"
              class="number-field"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              ref="autocompleteQtyInput"
              v-model="autocompleteQty"
              label="Times to reapeat Requirement"
              reverse
              type="number"
              min="1"
              step="1"
              hide-spin-buttons
              dense
              outlined
              hide-details
              :rules="rules"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <!-- <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        class="mr-4"
        color="error"
        outlined
        :disabled="loading"
        @click="$emit('close', null)"
        >{{ $t('cancel') }}</v-btn
      >
      <v-btn
        ref="botonUpdate"
        class="mr-3"
        color="secondary"
        :loading="loading"
        @click="applyAutocomplete()"
        >Apply</v-btn
      >
    </v-card-actions> -->
  </v-card>
</template>

<script>
export default {
  name: 'ApplyAutocompleteRequirementModal',
  props: {
    requirements: { type: Array, required: true },
    isSolo: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      autocompleteQty: 1,
      startFromAutocomplete: 1,
      rules: [
        (v) => !!v || 'Number Required',
        (v) => !isNaN(v) || 'Only numbers',
      ],
    }
  },

  methods: {
    applyAutocomplete() {
      const autocompleteQtyInput = this.$refs.autocompleteQtyInput
      const autocompleteStartFromInput = this.$refs.autocompleteStartFromInput
      if (
        !autocompleteStartFromInput?.validate() ||
        !autocompleteQtyInput?.validate()
      )
        return

      const finalRequirements = []

      const qty = parseInt(this.autocompleteQty)
      const startFromAutocomplete = parseInt(this.startFromAutocomplete)

      if (!qty || !startFromAutocomplete) return

      let position = this.isSolo ? this.requirements[0].position : 1

      for (let n = 1; n <= qty; n++) {
        const nReqs = []

        for (let idx = 0; idx < this.requirements.length; idx++) {
          const req = this.requirements[idx]

          if (!req.markForAutocomplete) {
            if (n === 1) {
              finalRequirements.push({
                ...req,
                position,
              })
            }
            position++
            continue
          }

          const descRequirement = req.descRequirement.replace(
            '%$0',
            `#${startFromAutocomplete + (n - 1)}`
          )

          nReqs.push({
            ...req,
            id: n === 1 ? req.id : req.id + '-' + idx + '-' + n,
            markForAutocomplete: false,
            position,
            descRequirement,
            ...(req.placard &&
              req.placardText && {
                placardText: req.placardText.replace(
                  '%$0',
                  `#${startFromAutocomplete + (n - 1)}`
                ),
              }),
          })
          position++
        }
        finalRequirements.push(...nReqs)
      }

      this.autocompleteQty = 1
      this.startFromAutocomplete = 1

      this.$emit('close', finalRequirements)
    },
  },
}
</script>

<style lang="scss" scoped>
.card-text {
  height: 100%;
  overflow-y: auto;
}
</style>
