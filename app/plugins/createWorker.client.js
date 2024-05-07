import ProcessImgWorker from '@/workers/processImg.worker'

export default (context, inject) => {
  inject('worker', {
    createWorkerImg() {
      return new ProcessImgWorker()
    },
  })
}
