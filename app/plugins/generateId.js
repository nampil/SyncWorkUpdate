export default ({ app }, inject) => {
  inject(
    'generateId',
    () => '' + new Date().getTime() + Math.floor(1000 + Math.random() * 9000)
  )
}
