import { env } from '@/main/env';

interface MatrixConfig {
  readonly enabled: boolean;
  readonly homeserverUrl: string;
  readonly allowedUsers: readonly string[];
}

const parseConfig = (): MatrixConfig => {
  const raw = env;
  const enabled = raw?.VITE_APP_MATRIX_ENABLED?.toLowerCase() === 'true';
  const homeserverUrl = raw?.VITE_APP_MATRIX_HOMESERVER_URL?.trim() ?? '';
  const allowedUsersRaw = raw?.VITE_APP_MATRIX_ALLOWED_USERS?.trim() ?? '';

  const allowedUsers =
    allowedUsersRaw === ''
      ? []
      : allowedUsersRaw
          .split(',')
          .map(id => id.trim().toLowerCase())
          .filter(Boolean);

  return { enabled, homeserverUrl, allowedUsers };
};

let cached: MatrixConfig | undefined;

const getConfig = (): MatrixConfig => {
  if (!cached) {
    cached = parseConfig();
  }
  return cached;
};

const isAdmitted = (actorId: string | undefined | null): boolean => {
  if (!actorId) {
    return false;
  }

  const config = getConfig();

  if (!config.enabled || config.homeserverUrl === '') {
    return false;
  }

  if (config.allowedUsers.length === 0) {
    return true;
  }

  return config.allowedUsers.includes(actorId.toLowerCase());
};

export { getConfig, isAdmitted };
export type { MatrixConfig };
