// frontend/firebaseConfig.js
import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFunctions } from '@react-native-firebase/functions';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCjQekVMEn-XFmyzu0lL5ebmCujx6aK8z8",
  authDomain: "safeher.firebaseapp.com",
  projectId: "safeher",
  storageBucket: "safeher.appspot.com",
  messagingSenderId: "183278996043",
  appId: "1:183278996043:android:9b9f24928e195bc359dbce",
};

// Initialize Firebase app if not already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} else {
  app = getApp();
}

// Initialize Firebase Auth
const auth = getAuth(app);
console.log('Firebase Auth initialized:', auth); // Debug log to confirm initialization

// Initialize other Firebase services
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions };