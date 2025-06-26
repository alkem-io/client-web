# Service Worker Version Handling Documentation

This document explains the logic and integration of the service worker version handling in this project, covering:

- `src/serviceWorker.ts` (registration and update logic)
- `public/service-worker.js` (worker script)
- `src/main/versionHandling.tsx` (React notification logic)
- `public/meta.json` (version metadata)

---

## 1. `src/serviceWorker.ts`

This file handles the registration and update lifecycle of the service worker in the browser. It:

- Registers the service worker (`public/service-worker.js`) when the app loads, if the environment and browser support it.
- Handles both initial registration and updates, calling optional `onSuccess` and `onUpdate` callbacks.
- Ensures the service worker is only registered for the correct domain (using `VITE_APP_ALKEMIO_DOMAIN`).
- Provides an `unregister` function to remove the service worker if needed.

**Usage:**

- Registered in the index entry point.
- Optionally, pass a config object with `onSuccess` and `onUpdate` handlers.

---

## 2. `public/service-worker.js`

This is the actual service worker script. It:

- Listens for install and activate events, calling `self.skipWaiting()` and `self.clients.claim()` for immediate control.
- Listens for messages from the client (e.g., version info).
- Periodically (or on fetch/navigation) checks the deployed version (from `meta.json`).
- Compares the deployed version to the client version (sent from the app).
- If a major or minor version change is detected, sends a `NEW_VERSION_AVAILABLE` message to all clients.
- Does **not** cache files (no offline support by default).

**Usage:**

- Placed in `public/service-worker.js` so it is served from the root.
- Registered by `serviceWorker.ts`.
- Communicates with the app via `postMessage`.

---

## 3. `src/main/versionHandling.tsx`

This React component (or hook) is responsible for:

- Listening for messages from the service worker (e.g., `NEW_VERSION_AVAILABLE`).
- Displaying a notification or dialog to the user when a new version is available.
- Providing a reload button to refresh the app and load the latest version.
- Optionally, using a custom notification component (e.g., `NotificationView`).

**Usage:**

- Imported at the top level of the app - `root.tsx`.
- Handles the UX for version updates, ensuring users are notified and can reload safely.

---

## 4. `public/meta.json`

This is the latest version metadata file, which:

- Is created at build time and contains the current version of the app. (see Vite config)
- Is used by the service worker to determine if a new version is available.
- Should not be cached!

## **How It Works Together**

1. On app load, `serviceWorker.ts` registers the service worker.
2. The service worker (`service-worker.js`) takes control and waits for the client to send its version.
3. The app sends its version to the service worker after registration.
4. The service worker periodically checks `meta.json` for the deployed version.
5. If a major or minor version change is detected, the service worker notifies all clients.
6. The React app (via `versionHandling.tsx`) listens for this message and shows a notification/dialog.
7. The user can reload the app to get the latest version.

---

## **Key Points**

- The service worker is used for version detection, not for caching/offline.
- Communication is via `postMessage` between the app and the service worker.
- The version is stored in `public/meta.json` and generated at build time.
- Only major/minor version changes trigger a user notification.

---

## **Troubleshooting**

- If the service worker is not controlling the page, reload after registration.
- Ensure `meta.json` is up to date after each deployment.
- Make sure the service worker is registered from the root scope.

---

For more details, see the code in each file and the comments within.
