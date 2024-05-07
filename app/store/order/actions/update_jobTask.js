import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TEMPLATES_TYPES } from '~/utils/dictionaries'

export async function update_jobTask(
  { dispatch, state, rootState },
  { jobTaskToSend, orderId, jobType, baseJobTask }
) {
  try {
    const user = rootState.auth.user.profile
    let base = baseJobTask
    jobTaskToSend.type = jobType

    if (jobType === TEMPLATES_TYPES.workToDos) {
      base = state.workToDos.filter((jn) => jn.id === baseJobTask.id)[0]
    }
    if (jobType === TEMPLATES_TYPES.allowables) {
      const _base = state.allowables.filter((jn) => jn.id === baseJobTask.id)[0]
      if (_base) {
        base = _base
      }
    }
    if (baseJobTask.pictures) {
      const picsToDelete = base.pictures.filter((pic) => {
        const index = jobTaskToSend.pictures
          .map((pic) => pic.codeName)
          .indexOf(pic.codeName)
        return index === -1
      })

      if (picsToDelete.length) {
        await dispatch('delete_pic_for_task', {
          picsToDelete,
          orderId,
          jobType,
          taskId: base.id,
        })
      }
    }
    /* Delete storage requirements */
    if (baseJobTask.requirements) {
      for (let i = 0; i < baseJobTask.requirements.length; i++) {
        let picsToDelete = []
        if (
          jobTaskToSend.requirements[i] &&
          base.requirements[i].pictures &&
          jobTaskToSend.requirements[i].id
        ) {
          picsToDelete = base.requirements[i].pictures.filter((pic) => {
            if (jobTaskToSend.requirements[i]) {
              const index = jobTaskToSend.requirements[i].pictures
                .map((e) => e.codeName)
                .indexOf(pic.codeName)

              return index === -1
            } else {
              return true
            }
          })
        }

        if (picsToDelete && picsToDelete.length) {
          await dispatch(
            'remove_pic_for_requirement',
            {
              picsToDelete,
              orderId,
              type: jobType,
              taskId: baseJobTask.id,
              requirementId: baseJobTask.requirements[i].id,
            }.catch((error) => {
              // TODO: Handle Error properly
              throw error
            })
          )
        }
      }
    }
    /* Files */
    if (jobTaskToSend.files && jobTaskToSend.files.length > 0) {
      const urls = await dispatch('upload_pic_for_tasks', {
        files: jobTaskToSend.files,
        orderId,
        jobType,
        taskId: baseJobTask.id,
      })

      if (urls?.length) {
        for (let i = 0; i < urls.length; i++) {
          const _pic = urls[i]
          const idx = jobTaskToSend.pictures.findIndex(
            (p) => p.codeName === _pic.codeName
          )
          if (idx === -1) continue

          jobTaskToSend.pictures.splice(idx, 1, _pic)
        }
      }

      delete jobTaskToSend.files
    }

    const orderRef = doc(db, 'orders', orderId)
    const jobTaskRef = doc(collection(orderRef, jobType), jobTaskToSend.id)
    const {
      requirements,
      materialsOrTools,
      deleteMaterialsOrTools,
      deleteRequirements,
      ...jobTask
    } = jobTaskToSend

    await updateDoc(jobTaskRef, {
      ...jobTask,
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })
    if (jobTaskToSend.materialsOrTools) {
      await dispatch('update_materialsOrTools', {
        materialsOrTools: jobTaskToSend.materialsOrTools,
        orderId,
        taskId: jobTaskToSend.id,
        jobType,
        deleteMaterialsOrTools: jobTaskToSend.deleteMaterialsOrTools,
      })
    }
    if (jobTaskToSend.requirements) {
      await dispatch('update_requirements', {
        requirements: jobTaskToSend.requirements,
        orderId,
        taskId: jobTaskToSend.id,
        jobType,
        deleteRequirements: jobTaskToSend.deleteRequirements,
      }).catch((error) => {
        throw error
      })
    }

    return ''
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)

    throw new Error(error)
  }
}
