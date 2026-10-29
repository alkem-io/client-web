import { env } from '@/main/env';
import { orLocalDevDefault } from '@/main/localDevServer';

/** The chat server of the server repo's local stack. */
const LOCAL_HOMESERVER_URL = 'http://localhost:8008';

const getConfig = () => ({
  homeserverUrl: orLocalDevDefault(env?.VITE_APP_MATRIX_HOMESERVER_URL?.trim() ?? '', LOCAL_HOMESERVER_URL),
});

export { getConfig };
