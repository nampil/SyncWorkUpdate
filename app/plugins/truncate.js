export default ({ app }, inject) => {
  function truncate(text, softLimit = 0) {
    try {
      if (!text) {
        return ''
      }
      let reText = text
      const count = text.length || 0

      if (count > softLimit) {
        const indexNextSpace = text.indexOf(' ', softLimit - 1)
        const indexNextDot = text.indexOf('.', softLimit - 1)

        const indexOfLimit = Math.min(indexNextDot, indexNextSpace)

        reText =
          indexOfLimit > -1
            ? text.substring(0, indexOfLimit) + ' ...'
            : text.substring(0, softLimit) + ' ...'
      }

      return reText
    } catch (error) {
      // eslint-disable-next-line
      console.log('error truncate', error)
      return text || ''
    }
  }
  inject('truncate', (text, softLimit) => truncate(text, softLimit))
}
