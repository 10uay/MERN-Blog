// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBC7y6Q2kCUh3kPBOKbP5mtbqScgMZwRWM",
    authDomain: "mern-blog-cc0ad.firebaseapp.com",
    projectId: "mern-blog-cc0ad",
    storageBucket: "mern-blog-cc0ad.appspot.com",
    messagingSenderId: "241313702543",
    appId: "1:241313702543:web:f61bfa12fa12a5ed1886fa"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);