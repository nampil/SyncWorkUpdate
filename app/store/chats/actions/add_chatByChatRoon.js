import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_chatByChatRoon(
  { dispatch },
  { sendMessage, attachmentFiles }
) {
  const msgRef = doc(collection(db, `chatRooms/${sendMessage.roomId}/chats`))

  const objectToSend = {
    ...sendMessage,
  }

  if (attachmentFiles && attachmentFiles.length) {
    const attachmentFilesInfo = await dispatch('upload_files_for_chats', {
      files: attachmentFiles,
      roomId: sendMessage.roomId,
      chatId: msgRef.id,
    })

    objectToSend.attachmentFiles = attachmentFilesInfo
  }

  await setDoc(msgRef, objectToSend)
}
