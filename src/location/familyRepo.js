// All backend access lives here. Reimplement this module to swap Firebase out.
//
// Data model (Realtime Database):
//   families/<familyId>/
//     pin:          "1234"            // parent approval code (see security note)
//     createdAt:    <ms>
//     child/
//       location:   { lat, lng, speed, heading, accuracy, ts }
//       status:     "tracking" | "stopped"
//       lastSeen:   <ms>
//     stopRequest:  { status: "pending"|"approved"|"denied", ts }

import { ref, set, update, onValue, get, child, serverTimestamp } from "firebase/database";
import { db, ensureSignedIn } from "../firebase";

// 6-char human-friendly pairing code -> used directly as familyId.
export function generatePairingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createFamily(pin) {
  await ensureSignedIn();
  const familyId = generatePairingCode();
  await set(ref(db, `families/${familyId}`), {
    pin,
    createdAt: serverTimestamp(),
    child: { status: "stopped", lastSeen: 0 },
  });
  return familyId;
}

export async function familyExists(familyId) {
  await ensureSignedIn();
  const snap = await get(ref(db, `families/${familyId}`));
  return snap.exists();
}

// Called from the background location task.
export async function pushLocation(familyId, coords) {
  await ensureSignedIn();
  await update(ref(db, `families/${familyId}/child`), {
    location: {
      lat: coords.latitude,
      lng: coords.longitude,
      speed: coords.speed ?? null, // m/s, -1 or null when unavailable
      heading: coords.heading ?? null,
      accuracy: coords.accuracy ?? null,
      ts: Date.now(),
    },
    status: "tracking",
    lastSeen: Date.now(),
  });
}

export async function setChildStatus(familyId, status) {
  await ensureSignedIn();
  await update(ref(db, `families/${familyId}/child`), { status });
}

// --- Stop-approval flow -----------------------------------------------------
// The child can only ASK to stop. The parent approves by entering the PIN on
// the parent device, which flips stopRequest.status to "approved".

export async function requestStop(familyId) {
  await ensureSignedIn();
  await set(ref(db, `families/${familyId}/stopRequest`), {
    status: "pending",
    ts: Date.now(),
  });
}

export async function clearStopRequest(familyId) {
  await ensureSignedIn();
  await set(ref(db, `families/${familyId}/stopRequest`), null);
}

// Parent side: verify PIN locally against the stored value, then approve.
export async function approveStop(familyId, enteredPin) {
  await ensureSignedIn();
  const snap = await get(child(ref(db, `families/${familyId}`), "pin"));
  if (!snap.exists() || String(snap.val()) !== String(enteredPin)) {
    return false;
  }
  await update(ref(db, `families/${familyId}/stopRequest`), { status: "approved", ts: Date.now() });
  return true;
}

export async function denyStop(familyId) {
  await ensureSignedIn();
  await update(ref(db, `families/${familyId}/stopRequest`), { status: "denied", ts: Date.now() });
}

// --- Subscriptions (return an unsubscribe fn) -------------------------------

export function subscribeChild(familyId, cb) {
  const r = ref(db, `families/${familyId}/child`);
  return onValue(r, (snap) => cb(snap.val() || {}));
}

export function subscribeStopRequest(familyId, cb) {
  const r = ref(db, `families/${familyId}/stopRequest`);
  return onValue(r, (snap) => cb(snap.val()));
}
