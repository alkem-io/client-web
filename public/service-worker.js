const VERSION_CHECK_INTERVAL = 30 * 1000; // 30 sec
const VERSION_URL = '/meta.json';

// in sync with serviceWorker.ts
const EventTypes = {
  CLIENT_VERSION: 'CLIENT_VERSION',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
};

// holding the current client version
let currentVersion = null;
let versionCheckTimer = null;

function isMajorOrMinorChanged(oldV, newV) {
  if (!oldV || !newV) return false;
  const [oMaj, oMin] = oldV.split('.');
  const [nMaj, nMin] = newV.split('.');
  return oMaj !== nMaj || oMin !== nMin;
}

function notifyClientsAboutUpdate(newVersion) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: EventTypes.NEW_VERSION_AVAILABLE, version: newVersion });
    });
  });
}

async function checkVersion() {
  if (!currentVersion) {
    return;
  }

  try {
    const response = await fetch(`${VERSION_URL}?${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    const newVersion = data.version;

    if (newVersion !== currentVersion && isMajorOrMinorChanged(currentVersion, newVersion)) {
      console.log('[SW] Different version detected: ', newVersion, currentVersion);
      notifyClientsAboutUpdate(newVersion);
    }
  } catch (error) {
    console.error('[SW] Version check failed: ', error);
  }
}

self.addEventListener('install', event => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activated');
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data?.type === EventTypes.CLIENT_VERSION) {
    currentVersion = event.data.version;
    console.log('[SW] Received client version:', currentVersion);
    checkVersion();

    if (!versionCheckTimer) {
      versionCheckTimer = setInterval(checkVersion, VERSION_CHECK_INTERVAL);
    }
  }
});

/* the following could be used for handling network failures but also caching strategies */
/* for now we don't want interceptions or caching */

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     fetch(event.request).catch(err => {
//       console.error('[SW] Network failure for:', event.request.url, err);
//
//       // Only respond if it's a network failure (e.g. offline)
//       // Otherwise, don't override the app's own error handling
//       if (!navigator.onLine) {
//         return new Response('You appear to be offline.', {
//           status: 503,
//           statusText: 'Offline',
//           headers: { 'Content-Type': 'text/plain' },
//         });
//       }
//
//       // For non-offline errors, rethrow or skip handling
//       throw err;
//     })
//   );
// });
