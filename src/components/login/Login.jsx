import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) });
    }
  };

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
      if (userDoc.exists()) {
        const userData = userDoc.data();
        //console.log("User data retrieved:", userData);
        toast.success(`Welcome back, ${userData.username}!`);
      } else {
        //console.log("No user data found for user:", user.uid);
        toast.error("No user data found. Please check your account.");
      }
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

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!username || !email || !password || !avatar.file) {
      toast.warn("Please fill in all fields and upload an avatar.");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      toast.warn("Please enter a valid email address.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("Creating user...");
      const res = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created.");
  
      if (!auth.currentUser) {
        throw new Error("User is not authenticated");
      }
  
      const imgUrl = await upload(avatar.file);
      console.log("Avatar uploaded:", imgUrl);
      await setDoc(doc(db, "users", res.user.uid), {
        username: username,
        email: email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: []
      });
      console.log("User document set in Firestore");
  
      await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });
      console.log("User chats document set in Firestore");

      setAvatar({ file: null, url: "" });
      toast.success("Account created! Logging in ...");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong! " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          username: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          id: user.uid,
          blocked: []
        });
        await setDoc(doc(db, "userchats", user.uid), { chats: [] });
        toast.success(`Welcome, ${user.displayName}! Logging in ...`);
        setTimeout(() => {
          window.location.reload();
        }, 4000);

      } else {
        const userData = userDoc.data();
        toast.success(`Welcome back, ${userData.username}!`);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

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
              <input type="text" placeholder="Email" name="email" required />
              <input type="password" placeholder="Password" name="password" required />
              <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
            </form>
            <button onClick={handleGoogleSignIn} className="google-sign-in" disabled={loading}>
            <img src="./gmailLogo.jpg" alt="Google Icon" className="google-icon" />
            {loading ? "Loading" : "Sign in with Google"}
          </button>
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
              <input type="text" placeholder="Username" name="username" required />
              <input type="text" placeholder="Email" name="email" required />
              <input type="password" placeholder="Password" name="password" required />
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
};

export default Login;