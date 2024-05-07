const functions = require("firebase-functions");
const { admin } = require("../../../../utils/admin");
const db = admin.firestore();
const {
  handleNotifications,
} = require("../../../../utils/handleNotifications");

exports.chatsOnCreate = functions.firestore
  .document("chatRooms/{chatRoomId}/chats/{chatId}")
  .onCreate(async (snapshot, context) => {
    const msg = snapshot.data();
    const chatRoomId = context.params.chatRoomId;
    const chatId = context.params.chatId;
    const chatRoom = await db
      .doc(`chatRooms/${chatRoomId}`)
      .get()
      .then((doc) => doc.data());

    const users = chatRoom.subscribers.filter((subs) => subs !== msg.sendBy);
    const senderProfile = await db
      .doc(`users/${msg.sendBy}`)
      .get()
      .then((doc) => doc.data());

    let title = "";

    if (!chatRoom.isGroup) {
      title = `${senderProfile.fullName} send a message`;
    } else {
      title = `${senderProfile.fullName} in ${chatRoom.name}`;
    }
    const imgUrl =
      senderProfile.avatar && senderProfile.avatar.url
        ? senderProfile.avatar.url
        : "";

    const message = {
      title,
      body: msg.text
        ? msg.text
        : msg.attachmentFiles.length
        ? "Attachment"
        : "",
    };
    const link = `?showChat=true&crid=${chatRoomId}&msg=${chatId}`;
    const type = "CHAT_MSG";

    return handleNotifications(
      { users, message, icon: imgUrl, link, type },
      false
    );
  });
