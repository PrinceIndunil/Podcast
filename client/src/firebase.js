// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth , GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDw8n0Xq7RuvmwzvdPgI9PgwDuPzoRHco0",
  authDomain: "mytube2-ebae1.firebaseapp.com",
  projectId: "mytube2-ebae1",
  storageBucket: "mytube2-ebae1.appspot.com",
  messagingSenderId: "653731768347",
  appId: "1:653731768347:web:b60003939755848ba630be",
  measurementId: "G-SG0W8C075K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const auth = getAuth()
export const provider = new GoogleAuthProvider();



export default app;