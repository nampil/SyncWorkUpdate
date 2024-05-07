import { getBlob, ref } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export function get_imgBlob(_, imgUrl) {
  const imgRef = ref(storage, imgUrl)
  return getBlob(imgRef)
}
