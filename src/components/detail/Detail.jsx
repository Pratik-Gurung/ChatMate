import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { useChatStore } from "../../lib/chatStore"
import { auth, db } from "../../lib/firebase"
import { useUserStore } from "../../lib/userStore"
import "./detail.css"

const Detail = () => {

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat} = useChatStore()
  const { currentUser } = useUserStore()

  const handleBlock = async() => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id)

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })
      changeBlock()
    } catch(err) {
      console.log(err)
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat()
  };

  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || "./avatar1.jpeg"} alt="" />
        <h2>{user?.username}</h2>
        <p>** caption **</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://static.scientificamerican.com/sciam/cache/file/A8C04F01-9779-477A-B104C8D52998E12C_source.jpg?w=1200" alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://static.scientificamerican.com/sciam/cache/file/A8C04F01-9779-477A-B104C8D52998E12C_source.jpg?w=1200" alt="" />
                <span>photo_2024_3.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://static.scientificamerican.com/sciam/cache/file/A8C04F01-9779-477A-B104C8D52998E12C_source.jpg?w=1200" alt="" />
                <span>photo_2024_4.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked 
            ? "You are Blocked!" : isReceiverBlocked 
            ? "User blocked" : "Block User"
          }
        </button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Detail