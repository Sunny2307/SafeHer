import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your Firebase configuration object (replace with your Firebase project config)
const firebaseConfig = {
  apiKey: "AIzaSyCjQekVMEn-XFmyzu0lL5ebmCujx6aK8z8",
  authDomain: "safeher.firebaseapp.com",
  projectId: "safeher",
  storageBucket: "safeher.appspot.com",
  messagingSenderId: "183278996043",
  appId: "1:183278996043:android:9b9f24928e195bc359dbce",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions };