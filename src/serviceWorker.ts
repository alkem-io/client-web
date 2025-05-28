// in sync with service-worker.js
export const EventTypes = {
  CLIENT_VERSION: 'CLIENT_VERSION',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
};

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  clientVersion?: string;
};

export function register(config: Config): void {
  if (import.meta.env.VITE_APP_ALKEMIO_DOMAIN && 'serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.VITE_APP_ALKEMIO_DOMAIN, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }
    window.addEventListener('load', () => {
      const swUrl = `${publicUrl}service-worker.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          if (navigator.serviceWorker.controller) {
            // pass the current client version to the worker
            navigator.serviceWorker.controller.postMessage({
              type: EventTypes.CLIENT_VERSION,
              version: config.clientVersion,
            });

            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            console.info('[SW] registered');

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
