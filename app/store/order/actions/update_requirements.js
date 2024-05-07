import { collection, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function update_requirements(
  { dispatch },
  { requirements, taskId, jobType, orderId, deleteRequirements }
) {
  try {
    // const reportsToDelete = []
    const requirementsIdTodelete = []
    const batch = writeBatch(db)

    // if (!requirements.length) {
    //   const qRequirements = query(
    //     collection(db, `orders/${orderId}/${jobType}/${taskId}/requirements`)
    //   )
    //   const querySnapshotRequirements = await getDocs(qRequirements)
    //   querySnapshotRequirements.forEach((doc) => {
    //     deleteDoc(doc.ref)
    //     // reportsToDelete.push(doc.id)
    //   })
    //   return
    // }

    for (let i = 0; i < requirements.length; i++) {
      const { isDuplicated, originReqId, ...requirement } = requirements[i]

      const ref = doc(
        collection(db, `orders/${orderId}/${jobType}/${taskId}/requirements`)
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
            const bucket = p.url.split('/b/')[1].split('/o/')[0]

            const path = `orders/${orderId}/${jobType}/${taskId}/requirements/${originReqId}/${p.oldCodeName}`
            const destinationPath = `orders/${orderId}/${jobType}/${taskId}/requirements/${ref.id}/${p.codeName}`
            return {
              path,
              destinationPath,
              bucketName: bucket,
              destinationBucketName: TYPES_BUCKET.daytona_system_main,
            }
          })

          const urls = await dispatch('copy_files_service', { files }).catch(
            (error) => {
              throw new Error(error)
            }
          )

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

        const urls = await dispatch('upload_pic_for_requirements', {
          files: requirement.files,
          orderId,
          type: jobType,
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
          collection(db, `orders/${orderId}/${jobType}/${taskId}/requirements`),
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
    if (deleteRequirements.length) {
      for (let i = 0; i < deleteRequirements.length; i++) {
        const requirementId = deleteRequirements[i]
        const refRequirement = doc(
          collection(db, `orders/${orderId}/${jobType}/${taskId}/requirements`),
          requirementId
        )

        // TODO: Los picture deben borrarse del storage en una Cloud Function
        // reportsToDelete.push(requirementId)
        batch.delete(refRequirement)
      }
    }
    await batch.commit()

    // const qRequirements = query(
    //   collection(db, `orders/${orderId}/${jobType}/${taskId}/requirements`)
    // )
    // const querySnapshotRequirements = await getDocs(qRequirements)
    // querySnapshotRequirements.forEach((doc) => {
    //   if (!requirementsIdTodelete.includes(doc.id)) {
    //     deleteDoc(doc.ref)
    //     reportsToDelete.push(doc.id)
    //   }
    // })

    // Eliminar reports que estaban en requirements
    // if (reportsToDelete && reportsToDelete.length) {
    //   const qReports = query(
    //     collection(db, `orders/${orderId}/${jobType}/${taskId}/reports`)
    //   )
    //   const querySnapshotReports = await getDocs(qReports)
    //   querySnapshotReports.forEach((doc) => {
    //     if (reportsToDelete.includes(doc.data().requirementId)) {
    //       deleteDoc(doc.ref)
    //     }
    //   })
    // }
  } catch (error) {
    // eslint-disable-next-line
    console.log('error', error)
    throw new Error(error)
  }
}
