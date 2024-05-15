# ChatMate

## Introduction
This is a real-time chat application built using modern web technologies. It features user authentication, real-time messaging, emoji support, and image uploads. It also allows for blocking and unblocking users. However, this app is chat-focused, therefore it is not a fully responsive app such as the video chat app, and the other buttons in the details column.

- **Enhancements:** 
  - **Separate Login and Register Pages:** The application features distinct login and register pages, each accessible through a link at the bottom of the respective form. Upon successful registration, users are automatically redirected to the login page.
  - **Improved Chat List Visualization:** When a chat is opened with a friend, the friend's name in the chat list is shaded, providing a clear visual indication of the active chat.
  - **Enhanced Friend Search and Add Functionality:** During a friend search, when a user is added as a friend, the "Add as Friend" button changes to "Loading" while the data is being processed. Once the friend is added, the button updates to "Added" and is disabled to prevent duplicate additions.
  - **Enhanced Login Notifications:** The login notifications have been improved to provide users with accurate messages regarding unsuccessful registration or login attempts. Additionally, the application greets users by their username upon successful sign-in.
  - **Code Customization:** Various code adjustments have been made to enhance readability and align with my coding preferences.

These enhancements improve the user experience by providing clear feedback, improving navigation, and ensuring the interface is intuitive and user-friendly.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Firebase**:
  - **Authentication**: For user sign-up and login functionality.
  - **Firestore**: A NoSQL database for storing user data and chat messages.
  - **Storage**: For uploading and storing images.
- **React Toastify**: For displaying notifications to the user.
- **CSS**: Custom styles for the application.
- **Emoji Picker**: For allowing users to insert emojis into their messages.
- **Timeago.js**: For displaying timestamps in a human-readable format.
- **Custom Utilities**:
  - `upload`: A utility function for handling image uploads.
  - `useChatStore` and `useUserStore`: Custom hooks for managing chat and user state.

## Features

- Real-time messaging with Firebase Firestore.
- User authentication and registration with Firebase Authentication.
- Image uploads and previews using Firebase Storage and HTML5.
- Emoji support with the `emoji-picker-react` library.
- User notifications with React Toastify.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pratik-Gurung/ChatMate.git
2. Navigate to the project directory:
   ```bash
   cd ChatMate
3. Install the dependencies:
   ```bash
   npm install
4. Start application:
   ```bash
   npm run dev
5. Open your web browser and go to http://localhost:3000 to access the application.

## Usage
1. Open your web browser and go to http://localhost:3000.
2. Create an account, make sure to make 2 new accounts (if testing out).
3. Login with one, and add the other one by username as Friends.
4. Start chatting!

## Credits
This project was inspired by a tutorial from Lama Dev. You can find the original tutorial [here](https://www.youtube.com/watch?v=domt_Sx-wTY&ab_channel=LamaDev). Special thanks to Lama Dev for the detailed guide and inspiration.
