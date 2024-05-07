import { Timestamp, collection, doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '~/plugins/firebase'
import { ORDER_STATUS } from '~/utils/dictionaries'

export async function add_order(_, { newOrder, fohFile, archiveOrder }) {
  const propertyId = this.$getPropertyId(newOrder)
  let fohImg = null

  if (fohFile) {
    fohImg = await handleUploadFile({ file: fohFile, propertyId })
  }

  const [fullYear, month, day] = newOrder.dateDueStr.split('-')
  const _dateDue = new Date(fullYear, month - 1, day)
  const docRef = doc(collection(db, 'orders'))
  const orderTosend = {
    ...newOrder,
    status: ORDER_STATUS.inactive,
    generalStatus: ORDER_STATUS.newOrder,
    fohImg,
    propertyId,
    contractors: [],
    contractorsUids: [],
    dateDue: Timestamp.fromDate(_dateDue),
    orderNew: true,
    onHold: false,
    archive: archiveOrder || false,
    assigned: false,
    edited: false,
    id: docRef.id,
  }

  await setDoc(docRef, orderTosend)
}
async function handleUploadFile({ file, propertyId }) {
  if (!file || !propertyId) {
    return null
  }
  const codeName =
    '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)

  file.codeName = codeName
  const storageRef = ref(storage, `fohPictures/${propertyId}/${codeName}`)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return {
    url: downloadURL,
    name: file.name,
    codeName: file.codeName,
    type: file.type,
  }
}
