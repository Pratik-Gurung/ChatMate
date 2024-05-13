import { useEffect, useState, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const endRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    if (chat && chat.messages) {
      scrollToBottom();
    }
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  const handleEmojiClick = (e) => {
    setText((prevText) => prevText + e.emoji);
    setOpenEmojiPicker(false);
  };

  const handleImageUpload = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      setImg({ file: imageFile, url: URL.createObjectURL(imageFile) });
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setImg({ file: null, url: "" });
      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar1.jpeg"} alt="User Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>** caption **</p>
          </div>
        </div>
        <div className="icons">
          <img src="./video.png" alt="Video Icon" />
          <img src="./info.png" alt="Info Icon" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="Message Image" />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Uploaded Image" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Image Icon" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImageUpload} />
          <img src="./camera.png" alt="Camera Icon" />
          <img src="./mic.png" alt="Microphone Icon" />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message ..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={ isCurrentUserBlocked || isReceiverBlocked }
        />
        <div className="emoji">
          <img src="./emoji.png" alt="Emoji Icon" onClick={() => setOpenEmojiPicker((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={openEmojiPicker} onEmojiClick={handleEmojiClick} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={ isCurrentUserBlocked || isReceiverBlocked }>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;