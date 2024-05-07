export default () => {
  onMessage = function (evt) {
    console.log('message received', evt)
    const result = 'llego'
    postMessage(result)
  }
}
