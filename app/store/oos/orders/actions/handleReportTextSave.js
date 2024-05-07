import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function handleReportTextSave(
  { rootState, dispatch },
  { taskId, orderId, text, type, mediaType, task, attachmentFile }
) {
  const userProfile = rootState.auth.user.profile
  const order = rootState.oos.orders.orders.find((o) => o.id === orderId)
  const _task = order[type].find((t) => t.id === task.taskId)

  const codeName =
    '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)

  const taskChatsRef = doc(
    db,
    `orders/${orderId}/${type}/${taskId}/taskChats`,
    codeName
  )

  const objectToSend = {
    orderId,
    text,
    task,
    createdBy: userProfile,
    createdAt: serverTimestamp(),
    attachmentFile,
  }

  if (attachmentFile && attachmentFile.length) {
    const attachmentFilesInfo = await dispatch('upload_file_for_chat', {
      file: attachmentFile[0],
      roomId: taskId,
      type: task.type,
    })

    objectToSend.attachmentFile = attachmentFilesInfo
  }

  await setDoc(taskChatsRef, objectToSend)

  const messageToUser = {
    title: `${order.woNumber} - ${type}: ${_task.title}`,
    body:
      mediaType === 'text'
        ? `${userProfile.name}: ${text}`
        : `${userProfile.name}: Voice Note`,
  }
  const users = []
  const requirements = _task.requirements

  if (requirements.length) {
    requirements.forEach((r) => {
      if (r.startedBy && !users.includes(r.startedBy.uid)) {
        users.push(r.startedBy.uid)
      }
    })
  }
  if (_task.beforeStartedBy) {
    users.push(_task.beforeStartedBy.uid)
  }
  if (_task.duringStartedBy) {
    users.push(_task.duringStartedBy.uid)
  }
  if (_task.afterStartedBy) {
    users.push(_task.afterStartedBy.uid)
  }
  if (_task.startedByArea) {
    const areas = _task.areasInReports
    areas.forEach((a) => {
      if (_task.startedByArea[a]) {
        users.push(_task.startedByArea[a].startedBy.uid)
      }
    })
  }
  if (_task.startedBy) {
    users.push(_task.startedBy.uid)
  }
  const finalUsers = users.length ? [...new Set(users)] : order.contractorsUids
  // eslint-disable-next-line
  console.log('finalUsers', finalUsers)

  if (!finalUsers.length) {
    return
  }

  const objToNotifyUser = {
    users: finalUsers,
    message: messageToUser,
    type: 'TEXT_REPORT',
    link: `${orderId}-${type}-${task.taskId}-${codeName}`,
    reportId: codeName,
  }

  await this.$notifyUsers(objToNotifyUser)
}
