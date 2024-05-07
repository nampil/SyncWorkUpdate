import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export function upload_foh_picture(
  { dispatch },
  { file, propertyId, orderId }
) {
  const codeName =
    '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)

  file.codeName = codeName
  const metadata = {
    contentType: file.type,
    codeName: file.codeName,
  }

  const storageRef = ref(storage, `fohPictures/${propertyId}/${codeName}`)
  const uploadTask = uploadBytesResumable(storageRef, file, metadata)
  uploadTask.on(
    'state_changed',
    (snapshot) => {},
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break
        case 'storage/canceled':
          // User canceled the upload
          break

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponsecha
          break
      }

      this.$mainAlertError('Oops! FOH image not saved')
      // eslint-disable-next-line
      console.log('error uploading FHO image: ', error)
      throw error
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        const objectToSend = {
          fohImg: {
            codeName,
            type: file.type,
            name: file.name,
            url: downloadURL,
          },
        }

        await dispatch('update_order', { orderId, objectToSend })
      })
    }
  )
}
