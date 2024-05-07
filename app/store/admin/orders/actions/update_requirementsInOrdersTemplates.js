import { collection, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_requirementsInOrdersTemplates(
  { dispatch },
  { requirements, taskId, jobType, orderId, deleteRequirements }
) {
  try {
    const requirementsIdTodelete = []
    const batch = writeBatch(db)

    for (let i = 0; i < requirements.length; i++) {
      const { isDuplicated, originReqId, ...requirement } = requirements[i]

      const ref = doc(
        collection(
          db,
          `admin/config/orders-templates/${orderId}/${jobType}/${taskId}/requirements`
        )
      )

      if (isDuplicated && requirement.pictures.length) {
        const picturesToDuplicate = requirement.pictures
          .filter((pic) => !pic.url.includes('data:image/jpeg;base64'))
          .map((p) => {
            return {
              ...p,
              oldCodeName: p.codeName,
              codeName: this.$generateId(),
            }
          })

        if (picturesToDuplicate.length) {
          const files = picturesToDuplicate.map((p) => {
            const path = `admin/config/orders-templates/${orderId}/${jobType}/${taskId}/requirements/${originReqId}/${p.oldCodeName}`
            const destinationPath = `admin/config/orders-templates/${orderId}/${jobType}/${taskId}/requirements/${ref.id}/${p.codeName}`
            return {
              path,
              destinationPath,
            }
          })

          const urls = await dispatch(
            'order/copy_files_service',
            { files },
            { root: true }
          ).catch((error) => {
            throw new Error(error)
          })

          picturesToDuplicate.forEach((ptd, i) => {
            const idx = requirement.pictures.findIndex(
              (p) => p.codeName === ptd.oldCodeName
            )

            const { oldCodeName, ...newPic } = ptd
            requirement.pictures.splice(idx, 1, { ...newPic, url: urls[i] })
          })
        }
      }

      /* Files Requirements Add */
      if (requirement.files) {
        const reqId = requirement.id ? requirement.id : ref.id

        const urls = await dispatch('upload_pic_for_order_task_requirements', {
          files: requirement.files,
          orderId,
          jobType,
          taskId,
          requirementId: reqId,
        })
        urls.forEach((url) => {
          const idxToReplace = requirement.pictures.findIndex((p) => {
            return p.codeName === url.codeName
          })

          if (idxToReplace === -1)
            throw new Error('No se encontro el elemento a reemplazar')

          requirement.pictures.splice(idxToReplace, 1, url)
        })
      }

      if (requirement.id) {
        const refRequirements = doc(
          collection(
            db,
            `admin/config/orders-templates/${orderId}/${jobType}/${taskId}/requirements`
          ),
          requirement.id
        )
        const { id, templateId, type, files, ...elementEdit } = requirement
        requirementsIdTodelete.push(requirement.id)
        await updateDoc(refRequirements, elementEdit)
      } else {
        const { id, type, templateId, files, ...elementEdit } = requirement
        requirementsIdTodelete.push(ref.id)
        batch.set(ref, elementEdit)
      }
    }

    // Eliminar requirements que no estan en jobTaskToSend
    if (deleteRequirements?.length) {
      for (let i = 0; i < deleteRequirements.length; i++) {
        const requirementId = deleteRequirements[i]
        const refRequirement = doc(
          collection(
            db,
            `admin/config/orders-templates/${orderId}/${jobType}/${taskId}/requirements`
          ),
          requirementId
        )

        batch.delete(refRequirement)
      }
    }
    await batch.commit()
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)
    throw new Error(error)
  }
}
