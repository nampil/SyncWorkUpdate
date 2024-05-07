import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reportsInvoices(
  { dispatch },
  { fromDate, toDate, invoiceCreated, invoiceCompleted, invoiceSenttoClient }
) {
  let _fromDate, _toDate
  if (!fromDate) {
    const currentDay = new Date()
    _fromDate = new Date(new Date().setDate(currentDay.getDate() - 7))
  } else {
    _fromDate = fromDate
  }
  if (!toDate) {
    _toDate = new Date()
  } else {
    _toDate = toDate
  }

  try {
    const invoiceRef = collectionGroup(db, 'invoice')
    const queryContrains = []
    if (invoiceCreated) {
      queryContrains.push(where('createdAt', '>=', _fromDate))
      queryContrains.push(where('createdAt', '<=', _toDate))
    }

    if (invoiceCompleted) {
      queryContrains.push(where('completeTimestamp', '>=', _fromDate))
      queryContrains.push(where('completeTimestamp', '<=', _toDate))
    }

    if (invoiceSenttoClient) {
      queryContrains.push(where('sentTimestamp', '>=', _fromDate))
      queryContrains.push(where('sentTimestamp', '<=', _toDate))
    }

    // if (statesSelected.length > 0) {
    //   queryContrains.push(where('state', 'in', statesSelected))
    // }

    // if (clientsSelected.length > 0) {
    //   queryContrains.push(where('client', 'in', clientsSelected))
    // }

    const q = query(invoiceRef, ...queryContrains)

    const querySnapshot = await getDocs(q)
    // const snapPromises = []
    const orders = []

    querySnapshot.forEach(async (docInv) => {
      const orderId = docInv.data().orderId

      const orderRef = doc(db, `orders/${orderId}`)
      const _order = await getDoc(orderRef).then((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))

      const _invoice = docInv.data()

      let subTotalFee = 0.0
      _invoice.items.forEach((element) => {
        if (!element.fee) {
          subTotalFee += element.qty * element.price
        }
      })
      const desc = (_invoice.discount * subTotalFee) / 100
      const clientDiscountTotal = parseFloat(subTotalFee - desc).toFixed(2)

      if (_order.processor) {
        dispatch(
          'users/get_usersById',
          { usersIds: [_order.processor] },
          { root: true }
        )
      }

      if (_order.invoiceDate) {
        const [year, month, day] = _order.invoiceDate.split('-')
        _order.invoiceDate = `${month}-${day}-${year}`
      }

      orders.push({
        ..._order,
        invoice: _invoice,
        dateDueFormatted: this.$formatDate(_order?.dateDue.toDate(), {
          americano: true,
        }),
        dateDueTimestamp: _order?.dateDue.toDate().getTime(),
        assigned: _order?.contractors.length > 0,
        unassigned: _order?.contractors.length === 0,
        estimatedCompleteDate:
          _order?.estimatedCompleteDate === '00-00-00'
            ? ''
            : _order?.estimatedCompleteDate,
        contractorList: _order?.contractors.map((c) => `${c.fullName}`) || [],
        clientDiscountTotal,
      })
    })

    return orders
  } catch (error) {
    throw new Error(error)
  }
}
