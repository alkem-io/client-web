import { env } from '@/main/env';

type MatrixConfig = {
  readonly homeserverUrl: string;
};

const parseConfig = (): MatrixConfig => ({
  homeserverUrl: env?.VITE_APP_MATRIX_HOMESERVER_URL?.trim() ?? '',
});

let cached: MatrixConfig | undefined;

const getConfig = (): MatrixConfig => {
  if (!cached) {
    cached = parseConfig();
  }
  return cached;
};

export { getConfig };
export type { MatrixConfig };
