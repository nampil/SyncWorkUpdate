export default function (to, from, savedPosition) {
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth',
    }
  }
  if (savedPosition) {
    return savedPosition
  }
  return { x: 0, y: 0 }
}
