import { collection, doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { ALERT_TYPES, NOTIFICATION_COLORS } from '@/utils/dictionaries'

export async function add_requirements(
  { dispatch, getters },
  { orderId, type, taskId, requirements, usersToNotify }
) {
  try {
    const batch = writeBatch(db)
    const notifyUsersPromises = []
    const order = getters.getOrderById(orderId)

    const task = getters.getTaskSelect

    if (requirements && requirements.length) {
      for (let i = 0; i < requirements.length; i++) {
        const requirement = requirements[i]

        const refRequirement = doc(
          collection(db, `orders/${orderId}/${type}/${taskId}/requirements`)
        )

        if (requirement.files && requirement.files.length > 0) {
          const urls = await dispatch('upload_pic_for_requirements', {
            files: requirement.files,
            orderId,
            type,
            taskId,
            requirementId: refRequirement.id,
          })
          requirement.pictures = urls
        }
        const { files, ...newRequirement } = requirement
        batch.set(refRequirement, {
          ...newRequirement,
          descRequirement: newRequirement.descRequirement
            .trim()
            .replace('/', '-'),
        })

        const messageToUser = {
          title: `${order.woNumber} - ${type} - ${task.title}`,
          body: `New Requirement${requirement.isReapply ? ' Reapply' : ''}: ${
            requirement.descRequirement
          }`,
        }

        const finalUsers = usersToNotify.length
          ? usersToNotify
          : order.contractorsUids

        const objToNotifyUser = {
          users: finalUsers,
          message: messageToUser,
          type: ALERT_TYPES.newRequirement,
          link: `${orderId}-${type}-${taskId}-${refRequirement.id}`,
          ...(requirement.isReapply && {
            extraData: JSON.stringify({ color: NOTIFICATION_COLORS.red }),
          }),
        }
        notifyUsersPromises.push(this.$notifyUsers(objToNotifyUser))
      }
    }

    await batch.commit()

    await Promise.all(notifyUsersPromises)
  } catch (error) {
    // eslint-disable-next-line
    console.log('error add_requirements', error)

    throw error
  }
}
