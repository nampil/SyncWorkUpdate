import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export function getUrl(_, { path }) {
  return getDownloadURL(ref(storage, path))
}
