import JSZip from 'jszip'
import copyExif from '~/plugins/copyExif'
import { JOB_TYPES } from '~/utils/dictionaries'

self.onmessage = function (event) {
  const {
    reports,
    downloadWithDate,
    downloadWithFolders,
    type,
    typeReport,
    canvas,
    downloadAllReports,
    downloadAllOrderReports,
    wo,
    task,
    tasks,
    requirements,
    title,
    fromBids,
    userDate = '',
    bids,
  } = event.data

  if (downloadAllReports && downloadWithFolders) {
    // eslint-disable-next-line
    console.log('handleDownloadAllReportsWithFolders')
    handleDownloadAllReportsWithFolders({
      reports,
      downloadWithDate,
      userDate,
      canvas,
      wo,
      task,
    })
  }
  if (!downloadAllReports && !downloadAllOrderReports) {
    // eslint-disable-next-line
    console.log('handleDownloadSectionReports')
    handleDownloadSectionReports({
      reports,
      downloadWithDate,
      userDate,
      type,
      typeReport,
      canvas,
      requirements,
      title,
      fromBids,
    })
  }
  if (downloadAllReports && !downloadWithFolders) {
    // eslint-disable-next-line
    console.log('handleDownloadAllReports')
    handleDownloadAllReports({
      reports,
      downloadWithDate,
      userDate,
      canvas,
      wo,
      task,
      bids,
    })
  }
  if (downloadAllOrderReports && !downloadWithFolders) {
    // eslint-disable-next-line
    console.log('handleDownloadAllOrderReportsV2')
    handleDownloadAllOrderReportsV2({
      reports,
      wo,
      tasks,
      downloadWithDate,
      userDate,
      canvas,
    })
  }
  if (downloadAllOrderReports && downloadWithFolders) {
    // eslint-disable-next-line
    console.log('handleDownloadAllOrderReportsV2WithFolders')
    handleDownloadAllOrderReportsV2WithFolders({
      reports,
      wo,
      tasks,
      downloadWithDate,
      userDate,
      canvas,
    })
  }
}
async function handleDownloadSectionReports({
  reports,
  downloadWithDate,
  userDate,
  type,
  typeReport,
  canvas,
  requirements,
  title,
  fromBids,
}) {
  let count = 1
  let reportsCounter = 1
  const position = {}
  const zip = new JSZip()
  const folderName = type.slice(0, 70).replace(/[^a-zA-Z0-9# ]/g, '_')
  const folder = zip.folder(folderName)
  const processTimeList = ['Before', 'During', 'After', 'General Reports']
  let amountReportsFailed = 0
  const blobPromises = []
  const newBlobReports = []
  let rowBlobReports = []

  if (!reports) return
  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const url = report.url
    const blobPromise = fetch(url)
      .then((r) => {
        if (r.status === 200) return r.blob()
      })
      .catch(() => {})

    blobPromises.push(blobPromise)
  }
  rowBlobReports = await Promise.all(blobPromises).catch((error) => {
    // eslint-disable-next-line
    console.log('rowBlobReports', error)
  })

  await handleWritingInImg({
    canvas,
    downloadWithDate,
    userDate,
    reports,
    rowBlobReports,
    newBlobReports,
    fromBids,
  })

  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const newBlob = newBlobReports[index]

    if (!newBlob) {
      amountReportsFailed = amountReportsFailed + 1
      // eslint-disable-next-line
      console.log('report', report)
      continue
    }

    if (report.task.type !== 'inspections' && !fromBids) {
      if (!report.fromRequirement && processTimeList.includes(typeReport)) {
        const name = report.descRequirement + '-' + count + '.jpg'
        count++
        folder.file('/General Reports/' + name, newBlob)
      }

      if (report.fromRequirement) {
        const from = requirements.map((e) => e.id).indexOf(report.requirementId)
        const _requirement = requirements[from]

        if (_requirement) {
          const _type = requirementType({ requirement: _requirement })
          let desc = requirements[from].descRequirement
          if (desc.length > 50) {
            desc = descriptionFormatted({ desc })
          }
          desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')
          const id = report.requirementId
          position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
          const name =
            title.replace(/[^a-zA-Z0-9# ]/g, '_') +
            '-' +
            _type +
            '-' +
            desc +
            '-' +
            report.codeName +
            '-' +
            position[`${id}`] +
            '.jpg'
          if (requirements[from].fromBefore) {
            folder.file(`/${desc}/` + name, newBlob)
          } else if (requirements[from].fromDuring) {
            folder.file(`/${desc}/` + name, newBlob)
          } else if (requirements[from].fromAfter) {
            folder.file(`/${desc}/` + name, newBlob)
          } else if (requirements[from].fromGeneral) {
            folder.file(`/${desc}/` + name, newBlob)
          }
        }
      } else if (!processTimeList.includes(typeReport)) {
        const name = report.descRequirement + '-' + reportsCounter + '.jpg'
        reportsCounter++
        folder.file('/Reports/' + name, newBlob)
      }
    } else if (report.task.type === 'inspections' && !fromBids) {
      if (report.fromRequirement) {
        const from = requirements.map((e) => e.id).indexOf(report.requirementId)
        if (requirements[from]) {
          let desc = requirements[from].descRequirement

          if (desc.length > 70) {
            desc = descriptionFormatted({ desc })
          }
          desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')

          const id = report.requirementId
          position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
          const name =
            title.replace(/[^a-zA-Z0-9# ]/g, '_') +
            '-' +
            desc +
            '-' +
            report.codeName +
            '-' +
            position[`${id}`] +
            '.jpg'
          folder.file(`/${desc}/` + name, newBlob)
        }
      } else {
        position[`${report.area}`] = position[`${report.area}`]
          ? position[`${report.area}`] + 1
          : 1
        const name =
          title.replace(/[^a-zA-Z0-9# ]/g, '_') +
          '-' +
          report.area +
          '-' +
          report.codeName +
          '-' +
          position[`${report.area}`] +
          '.jpg'

        folder.file(`/${report.area}/` + name, newBlob)
      }
    } else if (fromBids) {
      const name =
        title.replace(/[^a-zA-Z0-9# ]/g, '_') + '-' + reportsCounter + '.jpg'
      reportsCounter++
      folder.file(name, newBlob)
    }
  }
  const blobZip = await zip.generateAsync({ type: 'blob' })
  self.postMessage({ blobZip, type, amountReportsFailed })
}
async function handleDownloadAllReportsWithFolders({
  reports,
  downloadWithDate,
  userDate,
  canvas,
  wo,
  task,
}) {
  if (!reports) return

  const zip = new JSZip()
  let folderName = 'WO#' + wo + '-' + task.type + '-' + task.title
  folderName = folderName.slice(0, 70).replace(/[^a-zA-Z0-9# ]/g, '_')
  const folder = zip.folder(folderName)
  let before = 1
  let during = 1
  let after = 1
  let reportsCounter = 1
  const conts = []
  let name = ''
  const position = {}
  let amountReportsFailed = 0
  const blobPromises = []
  const newBlobReports = []
  let rowBlobReports = []

  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const url = report.url
    const blobPromise = fetch(url)
      .then((r) => {
        if (r.status === 200) return r.blob()
      })
      .catch(() => {})

    blobPromises.push(blobPromise)
  }
  rowBlobReports = await Promise.all(blobPromises).catch((error) => {
    // eslint-disable-next-line
    console.log('rowBlobReports', error)
  })

  await handleWritingInImg({
    canvas,
    downloadWithDate,
    userDate,
    reports,
    rowBlobReports,
    newBlobReports,
  })

  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const newBlob = newBlobReports[index]

    if (!newBlob) {
      amountReportsFailed = amountReportsFailed + 1
      // eslint-disable-next-line
      console.log('report', report)
      continue
    }
    const _title = task.title.replace(/[^a-zA-Z0-9# ]/g, '_')
    if (task.type === 'inspections') {
      if (report.fromRequirement) {
        const from = task.requirements
          .map((e) => e.id)
          .indexOf(report.requirementId)
        let desc = task.requirements[from].descRequirement

        if (desc.length > 50) {
          desc = descriptionFormatted({ desc })
        }
        desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')
        const indice = conts.map((e) => e.area).indexOf(report.area + desc)

        if (indice !== -1) {
          conts[indice].cont++
          name =
            _title +
            '-' +
            task.requirements[from].inspectionArea +
            '-' +
            desc +
            '-' +
            report.codeName +
            '-' +
            conts[indice].cont +
            '.jpg'
        } else {
          conts.push({
            area: report.area + desc,
            cont: 1,
          })
          name =
            _title +
            '-' +
            task.requirements[from].inspectionArea +
            '-' +
            desc +
            '-' +
            report.codeName +
            '-' +
            conts[conts.length - 1].cont +
            '.jpg'
        }
        folder.file(`/${report.area}/Requirements/${desc}/` + name, newBlob)
      } else {
        const indice = conts.map((e) => e.area).indexOf(report.area)
        if (indice !== -1) {
          conts[indice].cont++
          name =
            _title +
            '-' +
            report.area +
            '-' +
            report.codeName +
            '-' +
            conts[indice].cont +
            '.jpg'
        } else {
          conts.push({
            area: report.area,
            cont: 1,
          })
          name =
            _title +
            '-' +
            report.area +
            '-' +
            report.codeName +
            '-' +
            conts[conts.length - 1].cont +
            '.jpg'
        }
        folder.file(`/${report.area}/` + name, newBlob)
      }
    }
    if (task.type !== 'inspections') {
      if (report.before) {
        const name =
          report.descRequirement + '-' + report.codeName + '-' + before + '.jpg'
        before++
        folder.file('/Before/General Reports/' + name, newBlob)
      }
      if (report.during) {
        const name =
          report.descRequirement + '-' + report.codeName + '-' + during + '.jpg'
        during++
        folder.file('/During/General Reports/' + name, newBlob)
      }
      if (report.after) {
        const name =
          report.descRequirement + '-' + report.codeName + '-' + after + '.jpg'
        after++
        folder.file('/After/General Reports/' + name, newBlob)
      }
      if (!report.before && !report.during && !report.after) {
        if (report.fromRequirement) {
          const from = task.requirements
            .map((e) => e.id)
            .indexOf(report.requirementId)
          const _requirement = task.requirements[from]

          if (_requirement) {
            const _type = requirementType({ requirement: _requirement })
            let desc = task.requirements[from].descRequirement
            if (desc.length > 50) {
              desc = descriptionFormatted({ desc })
            }
            desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')

            const id = report.requirementId
            position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
            const name =
              _title +
              '-' +
              _type +
              '-' +
              desc +
              '-' +
              report.codeName +
              '-' +
              position[`${id}`] +
              '.jpg'
            if (task.requirements[from].fromBefore) {
              folder.file(`/Before/${desc}/` + name, newBlob)
            } else if (task.requirements[from].fromDuring) {
              folder.file(`/During/${desc}/` + name, newBlob)
            } else if (task.requirements[from].fromAfter) {
              folder.file(`/After/${desc}/` + name, newBlob)
            } else if (task.requirements[from].fromGeneral) {
              folder.file(`/${desc}/` + name, newBlob)
            }
          }
        } else {
          const name = report.codeName + '-' + reportsCounter + '.jpg'
          reportsCounter++
          folder.file('/Reports/' + name, newBlob)
        }
      }
    }
  }
  const blobZip = await zip.generateAsync({ type: 'blob' })
  self.postMessage({ blobZip, folderName, amountReportsFailed })
}
async function handleDownloadAllReports({
  reports,
  downloadWithDate,
  userDate,
  canvas,
  wo,
  task,
  bids,
}) {
  const zip = new JSZip()
  let folderName = task.length
    ? 'WO#' + wo + '-' + task.type + '-' + task.title
    : 'WO#' + wo
  folderName = folderName.slice(0, 70).replace(/[^a-zA-Z0-9# ]/g, '_')
  const folder = zip.folder(folderName)
  const position = {}
  let name = ''
  const conts = []
  let amountReportsFailed = 0
  const blobPromises = []
  const newBlobReports = []
  let rowBlobReports = []
  const names = {}

  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const url = report.url
    const blobPromise = fetch(url)
      .then((r) => {
        if (r.status === 200) return r.blob()
      })
      .catch(() => {})

    blobPromises.push(blobPromise)
  }
  rowBlobReports = await Promise.all(blobPromises).catch((error) => {
    // eslint-disable-next-line
    console.log('rowBlobReports', error)
  })

  await handleWritingInImg({
    canvas,
    downloadWithDate,
    userDate,
    reports,
    rowBlobReports,
    newBlobReports,
  })
  const contNames = {}
  if (bids.length) {
    for (let i = 0; i < bids.length; i++) {
      const _name = bids[i].title
      contNames[_name] = contNames[_name] ? contNames[_name] + 1 : 1
    }
  }

  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const newBlob = newBlobReports[index]

    if (!newBlob) {
      amountReportsFailed = amountReportsFailed + 1
      // eslint-disable-next-line
      console.log('report', report)
      continue
    }

    const _title = task.length ? task.title.replace(/[^a-zA-Z0-9# ]/g, '_') : ''
    if (task.type === 'inspections' && !bids.length) {
      if (report.fromRequirement) {
        const from = task.requirements
          .map((e) => e.id)
          .indexOf(report.requirementId)
        if (task.requirements[from]) {
          let desc = task.requirements[from].descRequirement

          if (desc.length > 50) {
            desc = descriptionFormatted({ desc })
          }
          desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')
          const indice = conts.map((e) => e.area).indexOf(report.area + desc)

          if (indice !== -1) {
            conts[indice].cont++
            name =
              _title +
              '-' +
              task.requirements[from].inspectionArea +
              '-' +
              desc +
              '-' +
              report.codeName +
              '-' +
              conts[indice].cont +
              '.jpg'
          } else {
            conts.push({
              area: report.area + desc,
              cont: 1,
            })
            name =
              _title +
              '-' +
              task.requirements[from].inspectionArea +
              '-' +
              desc +
              '-' +
              report.codeName +
              '-' +
              conts[conts.length - 1].cont +
              '.jpg'
          }
        }
      } else {
        const indice = conts.map((e) => e.area).indexOf(report.area)
        if (indice !== -1) {
          conts[indice].cont++
          name =
            _title +
            '-' +
            report.area +
            '-' +
            report.codeName +
            '-' +
            +conts[indice].cont +
            '.jpg'
        } else {
          conts.push({
            area: report.area,
            cont: 1,
          })
          name =
            _title +
            '-' +
            report.area +
            '-' +
            report.codeName +
            '-' +
            +conts[conts.length - 1].cont +
            '.jpg'
        }
      }
      folder.file('/' + name, newBlob)
    }
    if (task.type !== 'inspections' && !bids.length) {
      if (report.fromRequirement) {
        const from = task.requirements
          .map((e) => e.id)
          .indexOf(report.requirementId)

        const _requirement = task.requirements[from]

        if (_requirement) {
          const _type = requirementType({ requirement: _requirement })
          let desc = task.requirements[from].descRequirement
          if (desc.length > 50) {
            desc = descriptionFormatted({ desc })
          }
          desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')

          const _title = task.title.replace(/[^a-zA-Z0-9# ]/g, '_')
          const id = report.requirementId
          position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
          const name =
            _title +
            '-' +
            _type +
            '-' +
            desc +
            '-' +
            report.codeName +
            '-' +
            +position[`${id}`] +
            '.jpg'
          folder.file('/' + name, newBlob)
        }
      }
    }
    if (bids.length) {
      const id = report.bidId
      position[id] = position[id] ? position[id] + 1 : 1

      if (!Object.values(names).includes(report.titleBid) && !names[id]) {
        names[id] = report.titleBid
      }

      if (Object.values(names).includes(report.titleBid) && !names[id]) {
        names[id] = `${report.titleBid} ${contNames[report.titleBid]}`
        contNames[report.titleBid] = contNames[report.titleBid] - 1
      }
      const name =
        report.bidPosition.toString().padStart(2, '0') +
        '-' +
        names[id] +
        '-' +
        position[id] +
        '.jpg'
      folder.file('/' + name, newBlob)
    }
  }
  const blobZip = await zip.generateAsync({ type: 'blob' })
  self.postMessage({ blobZip, folderName, amountReportsFailed })
}

async function handleDownloadAllOrderReportsV2({
  reports,
  wo,
  tasks,
  downloadWithDate,
  userDate,
  canvas,
}) {
  const errors = []
  try {
    const zip = new JSZip()
    const folderName = 'WO#' + wo
    const folder = zip.folder(folderName)
    const position = {}
    let name = ''
    const conts = []
    let amountReportsFailed = 0
    const blobPromises = []
    const newBlobReports = []
    let rowBlobReports = []

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index]
      const url = report.url
      const blobPromise = fetch(url)
        .then((r) => {
          if (r.status === 200) return r.blob()
          // eslint-disable-next-line
          console.log('response status', r.status)
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log('error fectching blob', error)
          return { error: true, reason: error }
        })

      blobPromises.push(blobPromise)
    }
    rowBlobReports = await Promise.all(blobPromises).catch((error) => {
      // eslint-disable-next-line
      console.log('rowBlobReports', error)
    })

    await handleWritingInImg({
      canvas,
      downloadWithDate,
      userDate,
      reports,
      rowBlobReports,
      newBlobReports,
    })

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index]
      const newBlob = newBlobReports[index]

      if (!newBlob) {
        amountReportsFailed = amountReportsFailed + 1

        // eslint-disable-next-line
        console.log('report failed', report)
        continue
      }

      if (newBlob && newBlob.error) {
        amountReportsFailed = amountReportsFailed + 1
        errors.push({ error: newBlob.reason })
        // eslint-disable-next-line
        console.log('report', report, newBlob.reason)
        continue
      }
      const indexOfTask = tasks.map((t) => t.id).indexOf(report.task.id)

      if (indexOfTask === -1) {
        // eslint-disable-next-line
        console.log('report no task', report)
        continue
      }

      const task = tasks[indexOfTask]
      if (task.type === JOB_TYPES.inspections) {
        if (report.fromRequirement) {
          const from = task.requirements
            .map((e) => e.id)
            .indexOf(report.requirementId)
          if (task.requirements[from]) {
            let desc = task.requirements[from].descRequirement

            if (desc.length > 50) {
              desc = descriptionFormatted({ desc })
            }
            desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')
            const indice = conts.map((e) => e.area).indexOf(report.area + desc)

            if (indice !== -1) {
              conts[indice].cont++
              name =
                task.title.replace(/[^a-zA-Z0-9# ]/g, '_') +
                '-' +
                task.requirements[from].inspectionArea +
                '-' +
                desc +
                '-' +
                report.codeName +
                '-' +
                conts[indice].cont +
                '.jpg'
            } else {
              conts.push({
                area: report.area + desc,
                cont: 1,
              })
              name =
                task.title.replace(/[^a-zA-Z0-9# ]/g, '_') +
                '-' +
                task.requirements[from].inspectionArea +
                '-' +
                desc +
                '-' +
                report.codeName +
                '-' +
                conts[conts.length - 1].cont +
                '.jpg'
            }
          }
        } else {
          const indice = conts
            .map((e) => e.area)
            .indexOf(report.area + task.title.replace(/[^a-zA-Z0-9# ]/g, '_'))
          if (indice !== -1) {
            conts[indice].cont++
            name =
              task.title.replace(/[^a-zA-Z0-9# ]/g, '_') +
              '-' +
              report.area +
              '-' +
              report.codeName +
              '-' +
              conts[indice].cont +
              '.jpg'
          } else {
            conts.push({
              area: report.area + task.title.replace(/[^a-zA-Z0-9# ]/g, '_'),
              cont: 1,
            })
            name =
              task.title.replace(/[^a-zA-Z0-9# ]/g, '_') +
              '-' +
              report.area +
              '-' +
              report.codeName +
              '-' +
              conts[conts.length - 1].cont +
              '.jpg'
          }
        }

        folder.file('/' + name, newBlob)
      }
      if (task.type !== JOB_TYPES.inspections) {
        if (report.fromRequirement) {
          const from = task.requirements
            .map((e) => e.id)
            .indexOf(report.requirementId)

          const _requirement = task.requirements[from]

          if (_requirement) {
            const _type = requirementType({ requirement: _requirement })
            let desc = task.requirements[from].descRequirement
            if (desc.length > 50) {
              desc = descriptionFormatted({ desc })
            }
            desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')

            const _title = task.title.replace(/[^a-zA-Z0-9# ]/g, '_')
            const id = report.requirementId
            position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
            const name =
              _title +
              '-' +
              _type +
              '-' +
              desc +
              '-' +
              report.codeName +
              '-' +
              position[`${id}`] +
              '.jpg'

            folder.file('/' + name, newBlob)
          }
        }
      }
    }
    const blobZip = await zip.generateAsync({ type: 'blob' })
    self.postMessage({ blobZip, folderName, amountReportsFailed, errors })
  } catch (error) {
    errors.push(error)
    self.postMessage({ errors })
    // eslint-disable-next-line
    console.log('error', error)
  }
}

async function handleDownloadAllOrderReportsV2WithFolders({
  reports,
  wo,
  tasks,
  downloadWithDate,
  userDate,
  canvas,
}) {
  const errors = []
  try {
    const zip = new JSZip()
    const folderName = 'WO#' + wo
    const folder = zip.folder(folderName)
    const position = {}
    let name = ''
    const conts = []
    let amountReportsFailed = 0
    let before = 1
    let during = 1
    let after = 1
    let reportsCounter = 1
    const blobPromises = []
    const newBlobReports = []
    let rowBlobReports = []

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index]
      const url = report.url
      const blobPromise = fetch(url)
        .then((r) => {
          if (r.status === 200) return r.blob()
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log('error fectching blob', error)
          return { error: true, reason: error }
        })

      blobPromises.push(blobPromise)
    }
    rowBlobReports = await Promise.all(blobPromises).catch((error) => {
      // eslint-disable-next-line
      console.log('rowBlobReports', error)
    })

    await handleWritingInImg({
      canvas,
      downloadWithDate,
      userDate,
      reports,
      rowBlobReports,
      newBlobReports,
    })

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index]
      const newBlob = newBlobReports[index]

      if (!newBlob) {
        amountReportsFailed = amountReportsFailed + 1

        // eslint-disable-next-line
        console.log('report failed', report)
        continue
      }

      if (newBlob && newBlob.error) {
        amountReportsFailed = amountReportsFailed + 1
        errors.push({ error: newBlob.reason })
        // eslint-disable-next-line
        console.log('report', report, newBlob.reason)
        continue
      }
      const indexOfTask = tasks.map((t) => t.id).indexOf(report.task.id)
      if (indexOfTask === -1) {
        // eslint-disable-next-line
        console.log('report no task', report)
        continue
      }
      const task = tasks[indexOfTask]
      const _title = task.title.replace(/[^a-zA-Z0-9# ]/g, '_')

      if (task.type === 'inspections') {
        if (report.fromRequirement) {
          const from = task.requirements
            .map((e) => e.id)
            .indexOf(report.requirementId)
          let desc = task.requirements[from].descRequirement

          if (desc.length > 50) {
            desc = descriptionFormatted({ desc })
          }
          desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')
          const indice = conts.map((e) => e.area).indexOf(report.area + desc)

          if (indice !== -1) {
            conts[indice].cont++
            name =
              _title +
              '-' +
              task.requirements[from].inspectionArea +
              '-' +
              desc +
              '-' +
              report.codeName +
              '-' +
              conts[indice].cont +
              '.jpg'
          } else {
            conts.push({
              area: report.area + desc,
              cont: 1,
            })
            name =
              _title +
              '-' +
              task.requirements[from].inspectionArea +
              '-' +
              desc +
              '-' +
              report.codeName +
              '-' +
              conts[conts.length - 1].cont +
              '.jpg'
          }

          folder.file(
            `/${task.type}/${_title}/${report.area}
            /Requirements/${desc}/` + name,
            newBlob
          )
        } else {
          const indice = conts.map((e) => e.area).indexOf(report.area + _title)
          if (indice !== -1) {
            conts[indice].cont++
            name =
              _title +
              '-' +
              report.area +
              '-' +
              report.codeName +
              '-' +
              conts[indice].cont +
              '.jpg'
          } else {
            conts.push({
              area: report.area + _title,
              cont: 1,
            })
            name =
              _title +
              '-' +
              report.area +
              '-' +
              report.codeName +
              '-' +
              conts[conts.length - 1].cont +
              '.jpg'
          }
          folder.file(`/${task.type}/${_title}/${report.area}/` + name, newBlob)
        }
      }
      if (task.type !== 'inspections') {
        if (report.before) {
          const name =
            report.descRequirement +
            '-' +
            report.codeName +
            '-' +
            before +
            '.jpg'
          before++
          folder.file('/Before/General Reports/' + name, newBlob)
        }
        if (report.during) {
          const name =
            report.descRequirement +
            '-' +
            report.codeName +
            '-' +
            during +
            '.jpg'
          during++
          folder.file('/During/General Reports/' + name, newBlob)
        }
        if (report.after) {
          const name =
            report.descRequirement +
            '-' +
            report.codeName +
            '-' +
            after +
            '.jpg'
          after++
          folder.file('/After/General Reports/' + name, newBlob)
        }
        if (!report.before && !report.during && !report.after) {
          if (report.fromRequirement) {
            const from = task.requirements
              .map((e) => e.id)
              .indexOf(report.requirementId)
            const _requirement = task.requirements[from]
            if (_requirement) {
              const _type = requirementType({ requirement: _requirement })
              let desc = task.requirements[from].descRequirement
              if (desc.length > 50) {
                desc = descriptionFormatted({ desc })
              }
              desc = desc.replace(/[^a-zA-Z0-9# ]/g, '_')

              const id = report.requirementId
              position[`${id}`] = position[`${id}`] ? position[`${id}`] + 1 : 1
              const name =
                _title +
                '-' +
                _type +
                '-' +
                desc +
                '-' +
                report.codeName +
                '-' +
                position[`${id}`] +
                '.jpg'
              if (task.requirements[from].fromBefore) {
                folder.file(
                  `/${task.type}/${_title}/Before/${desc}/` + name,
                  newBlob
                )
              } else if (task.requirements[from].fromDuring) {
                folder.file(
                  `/${task.type}/${_title}/During/${desc}/` + name,
                  newBlob
                )
              } else if (task.requirements[from].fromAfter) {
                folder.file(
                  `/${task.type}/${_title}/After/${desc}/` + name,
                  newBlob
                )
              } else if (task.requirements[from].fromGeneral) {
                folder.file(`/${task.type}/${_title}/${desc}/` + name, newBlob)
              }
            }
          } else {
            const name = report.codeName + '-' + reportsCounter + '.jpg'
            reportsCounter++
            folder.file('/Reports/' + name, newBlob)
          }
        }
      }
    }
    const blobZip = await zip.generateAsync({ type: 'blob' })
    self.postMessage({ blobZip, folderName, amountReportsFailed })
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)
  }
}
function descriptionFormatted({ desc }) {
  const middle = desc.length / 2
  const sobra = desc.length - 50
  const firstPart = desc.slice(0, middle - sobra / 2)
  const lastPart = desc.slice(middle + sobra / 2)
  const _desc = firstPart + '_' + lastPart
  return _desc
}
function requirementType({ requirement }) {
  let _type = ''
  if (requirement.fromBefore) {
    _type = 'Before'
  }
  if (requirement.fromDuring) {
    _type = 'During'
  }
  if (requirement.fromAfter) {
    _type = 'After'
  }
  if (requirement.fromGeneral) {
    _type = 'General'
  }
  return _type
}
async function setImageOnCanvasAndThenWriteText({
  blob,
  canvas,
  textItems = [],
}) {
  try {
    const ctx = canvas.getContext('2d')
    const img = await createImageBitmap(blob)

    function drawImages(ctx, img, canvas) {
      return new Promise((resolve, reject) => {
        const loadedImageWidth = img.width
        const loadedImageHeight = img.height
        canvas.width = loadedImageWidth
        canvas.height = loadedImageHeight
        ctx.drawImage(img, 0, 0)

        textItems.forEach(({ textToWrite, textStyleOptions }) => {
          const x = textStyleOptions.positionX
            ? textStyleOptions.positionX * loadedImageWidth
            : 10

          const y = textStyleOptions.positionY
            ? textStyleOptions.positionY * loadedImageHeight
            : loadedImageHeight - 5

          const font = `${textStyleOptions.fontSize}px ${textStyleOptions.fontFamily}`

          ctx.font = font

          if (textStyleOptions.bg) {
            ctx.fillStyle = textStyleOptions.bg
            const width = ctx.measureText(textToWrite).width
            ctx.fillRect(x, y, width, parseInt(font, 10))
          }
          ctx.fillStyle = textStyleOptions.textColor
          ctx.textAlign = textStyleOptions.textAlign
          ctx.textBaseline = textStyleOptions.textBaseline
          const xCordOfText = x
          const yCordOfText = y

          ctx.fillText(textToWrite, xCordOfText, yCordOfText)
        })

        resolve(img)
        img.onerror = (e) => {
          reject(e)
        }
      })
    }
    await drawImages(ctx, img, canvas)
  } catch (error) {
    // eslint-disable-next-line
    console.log('setImageOnCanvasAndThenWriteText', error)
  }
}
async function getUrlImage({
  report,
  canvas,
  blob,
  downloadWithDate,
  userDate,
  fromBids,
}) {
  try {
    if (!downloadWithDate && !report.placard) {
      return blob
    }

    const textItems = []

    if (downloadWithDate) {
      let date = new Date()
      let textToWrite = ''

      // eslint-disable-next-line
      console.log('getUrlImage userDate', userDate)

      if (userDate) {
        textToWrite = userDate
      } else if (report.geoLoc && report.geoLoc.timestamp) {
        date = new Date(report.geoLoc.timestamp)
        textToWrite = formatDate(date, { iso: true })
      } else if (report.createdAt && report.createdAt.seconds) {
        date = new Date(Number(report.createdAt.seconds) * 1000)
        textToWrite = formatDate(date, { iso: true })
      }

      const textStyleOptions = {
        fontSize: 25,
        fontFamily: 'Arial',
        textColor: '#DCEF30',
        textAlign: 'left',
        textBaseline: 'bottom',
      }

      textItems.push({
        textToWrite,
        textStyleOptions,
      })
    }

    if (report.placard) {
      const textToWrite = report.placard.text
      const textStyleOptions = {
        fontSize: report.placard.fontSize * 1.33,
        fontFamily: 'Arial',
        textColor: report.placard.color || '#ffffff',
        textAlign: 'left',
        textBaseline: 'top',
        positionX: report.placard.position.x,
        positionY: report.placard.position.y,
        bg: report.placard.backgroundColor || '#000000',
      }
      textItems.push({
        textToWrite,
        textStyleOptions,
      })
    }

    await setImageOnCanvasAndThenWriteText({
      canvas,
      blob,
      textItems,
    })

    const _blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 1,
    })
    const newBlob = await copyExif(blob, _blob)

    return newBlob
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)
    return null
  }
}
function formatDate(d, options) {
  let response = ''
  const locale = 'en'
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

  response = `${mo.padStart(2, '0')}-${da.padStart(2, '0')}-${ye}`

  if (options && options.iso) {
    response = `${ye}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`
  }
  if (options && options.time) {
    response += ` - ${time}`
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

      const text = 'at' + ' ' + hoursCount
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

async function handleWritingInImg({
  canvas,
  downloadWithDate,
  userDate,
  reports,
  rowBlobReports,
  newBlobReports,
  fromBids,
}) {
  // eslint-disable-next-line
  console.log('handleWritingInImg')
  const newBlobPromises = []
  for (let index = 0; index < reports.length; index++) {
    const report = reports[index]
    const blob = rowBlobReports[index]
    if (!blob || blob.error) {
      continue
    }

    const newBlob = getUrlImage({
      report,
      canvas,
      blob,
      downloadWithDate,
      fromBids,
      userDate,
    })
    newBlobPromises.push(newBlob)
  }

  const results = await Promise.all(newBlobPromises)
  results.forEach((r, i) => {
    newBlobReports.push(r)
  })
}
