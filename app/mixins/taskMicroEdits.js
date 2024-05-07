export default {
  computed: {
    pageTitle() {
      const singular = this.jobType.type.slice(0, -1)
      let _type = singular.charAt(0).toUpperCase() + singular.slice(1)
      if (_type === 'Tool') {
        _type = 'Material and Tools'
      }
      if (this.editing) {
        return this.$t(`Edit ${_type}`)
      }
      return this.$t(`Add ${_type}`)
    },

    jobTitleLabel() {
      const singular = this.jobType.type.slice(0, -1)
      const _type = singular.charAt(0).toUpperCase() + singular.slice(1)
      return `${_type} Title`
    },

    jobDescLabel() {
      const singular = this.jobType.type.slice(0, -1)
      const _type = singular.charAt(0).toUpperCase() + singular.slice(1)
      return `${_type} Description`
    },
  },
  methods: {},
}
