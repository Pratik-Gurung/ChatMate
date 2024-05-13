import { useState } from "react"
import "./login.css"
import { toast } from "react-toastify"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth,db } from "../../lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import upload from "../../lib/upload"


const Login = () => {
  const [avatar, setAvatar] = useState({ file: null, url: "" })
  const [loading,setLoading] = useState(false)
  const [isLoginForm, setIsLoginForm] = useState(true); // Track current form 

  const handleAvatar = (e) => {
    if(e.target.files[0]){
      setAvatar({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      toast.success(`Welcome back, ${userData.username}!`);
    } catch (err) {
      console.log(err);
      if (err.code === "auth/missing-password" || err.code === "auth/invalid-email") {
        toast.error("Incorrect email or password. Please try again.");
      } else if (err.code === "auth/invalid-credential") {
        toast.error("Invalid email or password format. Please check your input.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
  
    // Check if any required field is empty
    if (!username || !email || !password || !avatar.file) {
      toast.warn("Please fill in all fields and upload an avatar.");
      setLoading(false);
      return;
    }
  
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      await setDoc(doc(db, "users", res.user.uid), {
        username: username,
        email: email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: []
      });
      await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });
      toast.success("Account created! You can login now!");
      e.target.reset(); // Reset form
      setAvatar({ file: null, url: "" });
      setIsLoginForm(true); // Switch to login form
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  //JSX rendering
  return (
    <div className="login">
      <div className="item">
        {isLoginForm ? (
          <>
            <div className="welcome-message">
              <h2>Welcome Back To</h2>
              <h1>ChatMate!</h1>
            </div>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Email" name="email" />
              <input type="password" placeholder="Password" name="password" />
              <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
            </form>
          </>
        ) : (
          <>
            <h2>Create an Account</h2>
            <form onSubmit={handleRegister}>
              <label htmlFor="file">
                <img src={avatar.url || "./avatar1.jpeg"} alt="" />
                Upload an image
              </label>
              <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
              <input type="text" placeholder="Username" name="username" />
              <input type="text" placeholder="Email" name="email" />
              <input type="password" placeholder="Password" name="password" />
              <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
            </form>
          </>
        )}
        <a href="#" id="switchlink" onClick={() => setIsLoginForm(!isLoginForm)}>
          Click here to {isLoginForm ? "Sign Up" : "Login"}
        </a>
      </div>
    </div>
  );
}

export default Login