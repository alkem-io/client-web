// in sync with service-worker.js
const EventTypes = {
  CLIENT_VERSION: 'CLIENT_VERSION',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
  CHECK_VERSION: 'CHECK_VERSION',
};
const VERSION_CHECK_INTERVAL = 30 * 1000; // 30 sec

// intervalId holds the ID returned by setInterval (number in browser)
let intervalId: ReturnType<typeof setInterval> | null = null;

type Config =
  | {
      onSuccess?: (registration: ServiceWorkerRegistration) => void;
      onUpdate?: (registration: ServiceWorkerRegistration) => void;
    }
  | undefined;

export function register(config?: Config): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = 'service-worker.js';

      navigator.serviceWorker
        .register(swUrl, { scope: '/' })
        .then(registration => {
          if (navigator.serviceWorker.controller) {
            console.info('[SW] Updated ');

            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            console.info('[SW] Registered');

            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        })
        .catch(() => {
          console.info('[SW] App is running in offline mode.');
        });
    });
  } else {
    console.warn('[SW] Service workers are not supported. ', 'serviceWorker' in navigator);
  }
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

type VersionUpdateCallback = (version: string) => void;

let versionUpdateListeners: VersionUpdateCallback[] = [];

export function onVersionUpdate(callback: VersionUpdateCallback) {
  if ('serviceWorker' in navigator) {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === EventTypes.NEW_VERSION_AVAILABLE) {
        callback(event.data.version);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);

    versionUpdateListeners.push(() => {
      navigator.serviceWorker.removeEventListener('message', handler);
    });
  }
}

export function cleanupVersionUpdateListeners() {
  versionUpdateListeners.forEach(dispose => dispose(''));
  versionUpdateListeners = [];
}

// sends the current client version to the service worker
export function syncClientVersion(version: string) {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers are not supported.');
    return;
  }

  if (!version) return;

  function startVersionCheckInterval(worker: ServiceWorker | null) {
    if (!worker) return;

    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
      worker.postMessage({
        type: EventTypes.CHECK_VERSION,
        version,
      });
    }, VERSION_CHECK_INTERVAL);
  }

  function sendClientVersion(worker: ServiceWorker | null, context: string) {
    if (!worker) {
      console.warn(`[SW] No worker available during ${context}`);
      return;
    }

    worker.postMessage({
      type: EventTypes.CLIENT_VERSION,
      version,
    });

    startVersionCheckInterval(worker);
  }

  navigator.serviceWorker.ready.then(reg => {
    sendClientVersion(reg.active, 'ready');
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    setTimeout(() => {
      sendClientVersion(navigator.serviceWorker.controller, 'controllerchange');
    }, 0);
  });
}
