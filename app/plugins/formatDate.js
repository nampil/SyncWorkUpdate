export default ({ app }, inject) => {
  function formatDate(d, options) {
    let response = ''

    const locale = app.i18n.locale

    let _date = null

    if (!d) {
      _date = new Date()
    } else if (typeof d.toDate === 'function') {
      _date = d.toDate()
    } else if (d.getTime) {
      _date = d
    } else {
      return
    }

    const ye = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
    }).format(_date)
    const mo = new Intl.DateTimeFormat(locale, {
      month: 'numeric',
    }).format(_date)
    const da = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
    }).format(_date)
    const time = new Intl.DateTimeFormat(locale, {
      timeStyle: 'short',
    }).format(_date)
    // const min = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d)
    // const sec = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(d)

    response = `${mo.padStart(2, '0')}-${da.padStart(2, '0')}-${ye}`

    if (options && options.iso) {
      response = `${ye}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`
    }

    if (options && options.europeo) {
      response = `${da.padStart(2, '0')}-${mo.padStart(2, '0')}-${ye}`
    }

    if (options && options.americano) {
      response = `${mo.padStart(2, '0')}-${da.padStart(2, '0')}-${ye}`
    }

    if (options && options.time) {
      response += ` - ${time}`
    }

    if (options && options.onlyTime) {
      response = time
    }

    if (options && options.relativeToNow) {
      const relativeFormater = new Intl.RelativeTimeFormat(locale, {
        style: 'long',
        numeric: 'auto',
      })

      const now = Date.now()
      const timestamp = _date.getTime()

      const passMillis = now - timestamp
      const passSecs = passMillis / 1000
      const passMins = passSecs / 60
      const passHours = passMins / 60
      let passDays = 0

      if (passMins < 1) {
        response = relativeFormater.format(Math.floor(passSecs) * -1, 'seconds')
      } else if (passMins < 60) {
        response = relativeFormater.format(Math.floor(passMins) * -1, 'minutes')
      } else if (passHours < 3) {
        response = relativeFormater.format(Math.floor(passHours) * -1, 'hours')
      } else if (passHours < 24) {
        const hoursOfDay = new Date().getHours()

        if (hoursOfDay < passHours) {
          passDays = 1
        } else {
          passDays = 0
        }
        const date = relativeFormater.format(Math.floor(passDays) * -1, 'day')
        const hoursCount = Math.floor(
          new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
          }).format(_date)
        )
        const text = app.i18n.tc('at', hoursCount)
        response = `${date} ${text} ${time}`
      } else {
        response = `${new Intl.DateTimeFormat(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
          hour12: true,
        }).format(_date)}`
      }
    }
    if (options && options.timestamp) {
      response = _date.getTime()
    }

    return response
  }

  inject('formatDate', (date, options) => formatDate(date, options))
}
