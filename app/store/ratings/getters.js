export default {
  get_rating:
    (state) =>
    ({ taskType, processTime, orderId, taskId, reqId }) => {
      return state.ratings.find((rating) =>
        rating
          ? rating.taskType === taskType &&
            rating.processTime === processTime &&
            rating.orderId === orderId &&
            rating.taskId === taskId &&
            rating.reqId === reqId
          : null
      )
    },
}
