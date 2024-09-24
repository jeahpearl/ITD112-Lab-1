import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDciy8zieJyOd0p5xcU8Eh0LZy9BKCAuuY",
  authDomain: "itd112-lab01daligdig.firebaseapp.com",
  projectId: "itd112-lab01daligdig",
  storageBucket: "itd112-lab01daligdig.appspot.com",
  messagingSenderId: "616030233373",
  appId: "1:616030233373:web:30af554b9f28be0dd2b7f4",
  measurementId: "G-99TD0H6SQ2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };