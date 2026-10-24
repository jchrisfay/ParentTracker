// Firebase setup for FamilyTrack.
//
// 1. Create a project at https://console.firebase.google.com
// 2. Add a Web app, copy its config into firebaseConfig below.
// 3. Enable "Anonymous" sign-in (Authentication > Sign-in method).
// 4. Create a Realtime Database (start in test mode for dev, then lock down
//    with the rules shown in README.md before going anywhere near real use).
//
// Swapping backends later: everything the app needs from Firebase is funneled
// through src/location/familyRepo.js. Reimplement that file against your own
// server (REST + WebSocket) and nothing else has to change.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  databaseURL: "https://REPLACE_ME-default-rtdb.firebaseio.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);

// Ensures we have a signed-in (anonymous) user before any DB access.
// Safe to call repeatedly; resolves to the current uid.
let signInPromise = null;
export function ensureSignedIn() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser.uid);
  if (!signInPromise) {
    signInPromise = signInAnonymously(auth).then((cred) => cred.user.uid);
  }
  return signInPromise;
}
