export default async (src, dest) => {
  const exif = await retrieveExif(src)

  return new Blob([dest.slice(0, 2), exif, dest.slice(2)], {
    type: 'image/jpeg',
  })
}

export const SOS = 0xffda
export const APP1 = 0xffe1
export const EXIF = 0x45786966
export const retrieveExif = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', ({ target: { result: buffer } }) => {
      const view = new DataView(buffer)
      let offset = 0
      if (view.getUint16(offset) !== 0xffd8)
        return reject(new Error('not a valid jpeg'))
      offset += 2

      while (true) {
        const marker = view.getUint16(offset)
        if (marker === SOS) break
        const size = view.getUint16(offset + 2)
        if (marker === APP1 && view.getUint32(offset + 4) === EXIF)
          return resolve(blob.slice(offset, offset + 2 + size))
        offset += 2 + size
      }
      return resolve(new Blob())
    })
    reader.readAsArrayBuffer(blob)
  })
