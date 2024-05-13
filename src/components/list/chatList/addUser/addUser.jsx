import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
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
        const userChatsRef = collection(db, "userchats");
        const userDoc = await getDoc(doc(userChatsRef, userData.id));
        const userChatsData = userDoc.data();
        if (userChatsData.chats.some(chat => chat.receiverId === currentUser.id)) {
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
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Updating user's chats
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      // Updating current user's chats
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
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
            {loading ? "Loading" : added ? "Added!" : "Add User"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;