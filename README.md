# FamilyTrack (skeleton)

A consent-based family location app. One phone is set up as **parent**, the
other as **child**. The child phone shares its location; the parent sees it
live on a map. Sharing is always visible on the child phone, and the child can
only stop it with the parent's approval.

This is a runnable skeleton, not a finished product. Read "Honest limits" and
"Before real use" below.

## What works

- **Role picker** on first launch (parent / child), remembered on-device.
- **Pairing** via a 6-character code the parent shows and the child types in.
- **Live location + speed** from the child, shown on a map on the parent phone.
- **Always-visible sharing indicator on the child phone.** On Android this is a
  persistent foreground-service notification that the app cannot hide while
  sharing runs. On iOS the system shows its own location indicator.
- **Parent-approved stop.** The child taps "Ask parent to stop sharing"; the
  parent enters their PIN on the parent phone to approve. Only then does the
  child stop.

## Run it

```bash
cd familytrack
npm install
npx expo start
```

You need a **development build** (not just Expo Go) because background location
with a foreground service uses native config:

```bash
npx expo install expo-dev-client
npx eas build --profile development --platform android   # or ios
```

Install the build on two phones, open the app, pick a role on each.

## Firebase setup (required)

1. Create a project at <https://console.firebase.google.com>.
2. Add a **Web app**; paste its config into `src/firebase.js`.
3. Enable **Anonymous** sign-in under Authentication.
4. Create a **Realtime Database**.

Start with these rules for development, then tighten (see below):

```json
{
  "rules": {
    "families": {
      "$fid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## Honest limits

- **You can't make an app un-deletable with Expo/stores.** Truly preventing a
  child from uninstalling or force-stopping the app needs Android Device Owner
  (MDM) provisioning — a different, heavier path. This skeleton gates the
  in-app stop button behind parent approval and keeps the sharing notification
  visible; it does not block uninstall.
- **iOS is stricter than Android**: no custom permanent status-bar icon, and no
  uninstall prevention. The behaviors differ by platform on purpose.
- Background location on both platforms requires the user to grant "Always"
  permission; the OS may still throttle updates to save battery.

## Before real use

- **Hash the PIN.** Right now the PIN is stored and compared in plaintext for
  clarity. Store a salted hash and verify server-side (e.g. a Cloud Function),
  not with a client-readable value.
- **Lock down database rules** so a family node is readable/writable only by its
  paired devices, not any authenticated user.
- **Consent & law.** Monitoring another person's location is regulated. This is
  intended for a parent and their own minor child, with the child aware. Make
  the install visible, get age-appropriate agreement, and check the laws that
  apply to you before tracking anyone.

## Swapping Firebase out

Everything backend-facing lives in `src/location/familyRepo.js`. Reimplement
that one module against your own server and the rest of the app is unchanged.
