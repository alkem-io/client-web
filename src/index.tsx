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
// registration). Deployed builds therefore always register, flag or no flag.
//
// On the dev server registration is ON by default too, so push works locally with
// no setup — push REQUIRES a registration, since PushManager hangs off
// ServiceWorkerRegistration. A developer who wants the dev server without a
// service worker opts out with VITE_ENABLE_SERVICE_WORKER=false in .env.local
// (gitignored). Defaulting to on-unless-'false' means a missing or stale .env
// still leaves push working.
const serviceWorkerEnabledInDev = import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false';

if (!import.meta.hot || serviceWorkerEnabledInDev) {
  registerServiceWorker();
} else {
  // Dev server, explicitly opted out. Tear down any SW a prior build or session
  // left behind, so the opt-out takes effect on the next reload.
  unregisterServiceWorker();
}
