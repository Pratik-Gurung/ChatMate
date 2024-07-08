import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(null); // Track selected chat

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  // Effect to fetch user chats
  useEffect(() => { 
    const unSubscribe = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (snapshot) => {
        const userData = snapshot.data();
        const items = userData?.chats || [];

        // Fetch additional user details for each chat
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnapshot = await getDoc(userDocRef);
          const user = userDocSnapshot.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        const sortedChats = chatData.sort((a, b) => b.updatedAt - a.updatedAt);
        setChats(sortedChats);
      }
    );

    return () => unSubscribe();
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const updatedChats = chats.map((item) => {
      return item.chatId === chat.chatId ? { ...item, isSeen: true } : item;
    });

    const userChatsRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatsRef, { chats: updatedChats });
      setSelectedChat(chat);
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.error("Error updating seen status:", error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          className={`item ${selectedChat && selectedChat.chatId === chat.chatId ? "selected" : ""}`}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat.isSeen ? "" : "#1b9d4b" }}
        >
          <img
            src={chat.user.blocked.includes(currentUser.id) ? "./avatar1.jpeg" : chat.user.avatar || "./avatar.jpeg"}
            alt=""
          />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;