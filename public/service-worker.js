const VERSION_URL = '/meta.json';

// in sync with serviceWorker.ts
const EventTypes = {
  CLIENT_VERSION: 'CLIENT_VERSION',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
  CHECK_VERSION: 'CHECK_VERSION',
};

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

async function checkVersion(currentVersion) {
  if (!currentVersion) {
    return;
  }

  try {
    const response = await fetch(`${VERSION_URL}?${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    const newVersion = data.version;

    if (newVersion !== currentVersion && isMajorOrMinorChanged(currentVersion, newVersion)) {
      console.log('[SW] Different version detected: ', currentVersion, newVersion);
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
  if (event.data?.type === EventTypes.CLIENT_VERSION && event.data.version) {
    console.log('[SW] CLIENT_VERSION: ', event.data.version);
    checkVersion(event.data.version);
  }

  if (event.data?.type === EventTypes.CHECK_VERSION && event.data.version) {
    console.log('[SW] CHECK_VERSION: ', event.data.version);
    checkVersion(event.data.version);
  }
});

// --- Push Notification Handlers ---

self.addEventListener('push', event => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    console.error('[SW] Failed to parse push payload');
    return;
  }

  const { title, body, url, eventType, tag } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url },
      // A payload-supplied tag lets a newer digest REPLACE the previous
      // unattended one for the same track instead of stacking a toast per
      // dispatch (FR-024). Senders that supply no tag keep the legacy
      // unique-per-delivery construction, so non-messaging pushes are
      // unaffected and still stack.
      tag: tag || `${eventType}-${Date.now()}`,
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  // Resolve relative URLs to absolute
  const absoluteUrl = new URL(url, self.location.origin).href;

  const handleClick = async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameOriginClients = allClients.filter(
      client => client.url && new URL(client.url).origin === self.location.origin
    );

    // Prefer the window the user is actually looking at. Taking the first
    // same-origin client would navigate an arbitrary BACKGROUND tab away from
    // whatever it was showing.
    const existingClient =
      sameOriginClients.find(client => client.focused) ||
      sameOriginClients.find(client => client.visibilityState === 'visible') ||
      sameOriginClients[0];

    if (existingClient) {
      await existingClient.focus();
      // Navigate directly if the client supports it, otherwise use postMessage
      if ('navigate' in existingClient) {
        await existingClient.navigate(absoluteUrl);
      } else {
        existingClient.postMessage({ type: 'PUSH_NOTIFICATION_CLICK', url });
      }
    } else {
      await self.clients.openWindow(absoluteUrl);
    }
  };

  event.waitUntil(handleClick());
});

self.addEventListener('pushsubscriptionchange', event => {
  const resubscribe = async () => {
    try {
      // Try to get the VAPID key from the old subscription's options
      const oldSubscription = event.oldSubscription;
      const applicationServerKey = oldSubscription?.options?.applicationServerKey;

      if (!applicationServerKey) {
        console.error('[SW] No application server key available for re-subscription');
        return;
      }

      const newSubscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Notify the client about the subscription change
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.postMessage({
          type: 'PUSH_SUBSCRIPTION_CHANGED',
          subscription: newSubscription.toJSON(),
        });
      }
    } catch (error) {
      console.error('[SW] Failed to re-subscribe after pushsubscriptionchange:', error);
    }
  };

  event.waitUntil(resubscribe());
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
