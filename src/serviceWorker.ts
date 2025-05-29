// in sync with service-worker.js
const EventTypes = {
  CLIENT_VERSION: 'CLIENT_VERSION',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
};

type Config =
  | {
      onSuccess?: (registration: ServiceWorkerRegistration) => void;
      onUpdate?: (registration: ServiceWorkerRegistration) => void;
    }
  | undefined;

export function register(config?: Config): void {
  if (import.meta.env.VITE_APP_ALKEMIO_DOMAIN && 'serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.VITE_APP_ALKEMIO_DOMAIN, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }
    window.addEventListener('load', () => {
      const swUrl = new URL('service-worker.js', publicUrl).toString();

      navigator.serviceWorker
        .register(swUrl)
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
  if ('serviceWorker' in navigator && version) {
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({
        type: EventTypes.CLIENT_VERSION,
        version,
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      navigator.serviceWorker.controller?.postMessage({
        type: EventTypes.CLIENT_VERSION,
        version,
      });
    });
  }
}
