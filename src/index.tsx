import { createRoot } from 'react-dom/client';
import Root from './root';
import { register as registerServiceWorker } from './serviceWorker';

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);

registerServiceWorker();
