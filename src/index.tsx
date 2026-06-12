import { createRoot } from 'react-dom/client';
import '@/crd/styles/crd.css';
import Root from './root';
import { register as registerServiceWorker, unregister as unregisterServiceWorker } from './serviceWorker';

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);

if (import.meta.env.PROD) {
  registerServiceWorker();
} else {
  // Dev: a registered service worker caches stale bundles and masks Vite
  // HMR/restarts — you reload but keep getting the old app. Keep it OFF in dev
  // and tear down any SW a prior build/session left behind.
  unregisterServiceWorker();
}
