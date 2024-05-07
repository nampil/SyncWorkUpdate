export async function remove_jobTaskInspections(
  { dispatch },
  { orderId, inspections, jobType }
) {
  // const batch = writeBatch(db)
  for (let i = 0; i < inspections.length; i++) {
    const inspection = inspections[i]
    // const docRef = doc(db, `orders/${orderId}/${jobType}`, inspection.id)
    // batch.delete(docRef)

    await dispatch('remove_jobTask', {
      orderId,
      jobTask: inspection,
      jobType,
    })
  }
  // await batch.commit()
}
