import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore'

import { db } from '@/plugins/firebase'
import { ORDER_STATUS } from '~/utils/dictionaries'

export async function add_ordersBatch(_, { newOrders, archiveOrders }) {
  const batch = writeBatch(db)
  const nOrderToUpdload = newOrders.length

  newOrders.forEach((order) => {
    const [month, day, mYear] = order.dateDue.split('-')
    const fullYear = '20' + mYear
    const _date = new Date(fullYear, month - 1, day)
    const propertyId = this.$getPropertyId(order)
    const docRef = doc(collection(db, 'orders'))
    const orderTosend = {
      ...this.dummyOrder,
      ...order,
      status: ORDER_STATUS.inactive,
      generalStatus: ORDER_STATUS.newOrder,
      propertyId,
      fohImg: '',
      contractors: [],
      contractorsUids: [],
      dateDue: Timestamp.fromDate(_date),
      orderNew: true,
      onHold: false,
      archive: archiveOrders,
      assigned: false,
      edited: false,
      id: docRef.id,
    }

    delete orderTosend.contractor

    batch.set(docRef, orderTosend)
  })
  await batch.commit()

  return nOrderToUpdload
}
