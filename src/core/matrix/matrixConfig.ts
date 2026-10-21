import { env } from '@/main/env';

const getConfig = () => ({
  homeserverUrl: env?.VITE_APP_MATRIX_HOMESERVER_URL?.trim() ?? '',
});

export { getConfig };
