import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const userData = querySnapShot.docs[0].data();
        setUser(userData);

        // Check if user is already in chatlist
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userDoc = await getDoc(userChatsRef);
        const userChatsData = userDoc.data();

        // Ensure userChatsData.chats is always an array
        const chats = Array.isArray(userChatsData?.chats) ? userChatsData.chats : [];
        if (chats.some(chat => chat.receiverId === userData.id)) {
          setAdded(true); // (true) if user is already in chatlist
        } else {
          setAdded(false); // Reset added state if user not in chatlist
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    const chatRef = collection(db, "chats");
    const userChatsRef = doc(db, "userchats", currentUser.id);
    const otherUserChatsRef = doc(db, "userchats", user.id);

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Ensure the user chats documents exist
      await setDoc(userChatsRef, { chats: arrayUnion() }, { merge: true });
      await setDoc(otherUserChatsRef, { chats: arrayUnion() }, { merge: true });

      // Updating user's chats
      await updateDoc(userChatsRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      // Updating current user's chats
      await updateDoc(otherUserChatsRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      setLoading(false);
      setAdded(true);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar1.jpeg"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={loading || added}>
            {loading ? "Loading" : added ? "Friends!" : "Add As Friend"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;