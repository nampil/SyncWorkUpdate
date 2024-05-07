export default ({ app, store }, inject) => {
  function handleAlert(text, options) {
    store.dispatch('alert/handleAlert', {
      text,
      ...options,
    })
  }
  function handleAlertSuccess(text, options) {
    const payload = {
      text,
      color: 'success',
      showAlert: true,
      ...options,
    }
    store.dispatch('alert/handleAlert', payload)
  }
  function handleAlertError(text, options) {
    const payload = {
      text,
      color: 'error',
      showAlert: true,
      ...options,
    }
    store.dispatch('alert/handleAlert', payload)
  }
  function handleAlertInfo(text, options) {
    const payload = {
      text,
      color: 'warning lighten-1',
      showAlert: true,
      ...options,
    }
    store.dispatch('alert/handleAlert', payload)
  }

  inject('mainAlert', (text, options) => handleAlert(text, options))
  inject('mainAlertSuccess', (text, options) =>
    handleAlertSuccess(text, options)
  )
  inject('mainAlertError', (text, options) => handleAlertError(text, options))
  inject('mainAlertInfo', (text, options) => handleAlertInfo(text, options))
}
