import { createRoot } from 'react-dom/client';
import '@/crd/styles/crd.css';
import './index.css';
import Root from './root';
import { register as registerServiceWorker, unregister as unregisterServiceWorker } from './serviceWorker';

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);

// `import.meta.hot` is defined ONLY under the Vite dev server. Do not use
// `import.meta.env.PROD` here: the deployed dev/test environments are built with
// `build:dev` (`vite build --mode development`), where PROD is false — that made
// them unregister the service worker on every load and silently killed push
// notifications (`navigator.serviceWorker.ready` never settles without a
// registration).
//
// Push REQUIRES a registration (PushManager hangs off ServiceWorkerRegistration),
// so set VITE_ENABLE_SERVICE_WORKER=true in .env.local to opt the dev server back
// in and test push with HMR still running.
const enableServiceWorkerInDev = import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true';

if (!import.meta.hot || enableServiceWorkerInDev) {
  registerServiceWorker();
} else {
  // Dev server only: a registered service worker can cache stale bundles and mask
  // Vite HMR/restarts — you reload but keep getting the old app. Off by default,
  // and tear down any SW a prior build/session left behind.
  unregisterServiceWorker();
}
