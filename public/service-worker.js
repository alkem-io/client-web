const VERSION_CHECK_INTERVAL = 30 * 1000; // 30 sec
const VERSION_URL = '/meta.json';

// in sync with serviceWorker.ts
const EventTypes = {
  CLIENT_VERSION: 'CLIENT_VERSION',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
};
let currentVersion = null;

self.addEventListener('install', event => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activated');
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', event => {
  if (event.data?.type === EventTypes.CLIENT_VERSION) {
    currentVersion = event.data.version;
    console.log('[SW] Registered client version:', currentVersion);
  }
});

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
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    const data = await response.json();
    const newVersion = data.version;

    if (!currentVersion) {
      return;
    }

    if (newVersion !== currentVersion && isMajorOrMinorChanged(currentVersion, newVersion)) {
      console.log('[SW] New version detected:', newVersion);
      notifyClientsAboutUpdate(newVersion);
    }
  } catch (error) {
    console.error('[SW] Version check failed:', error);
  }
}

setInterval(checkVersion, VERSION_CHECK_INTERVAL);

