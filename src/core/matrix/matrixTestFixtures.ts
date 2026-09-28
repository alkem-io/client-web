import 'fake-indexeddb/auto';
import type { CredentialRecord } from './storage';

const HOMESERVER = 'https://matrix.dev-alkem.io';

const setMatrixHomeserver = (url: string): void => {
  Object.defineProperty(window, '_env_', {
    value: { VITE_APP_MATRIX_HOMESERVER_URL: url },
    writable: true,
    configurable: true,
  });
};

const makeCredentialRecord = (overrides: Partial<CredentialRecord> = {}): CredentialRecord => ({
  userId: '@alice:matrix.dev-alkem.io',
  deviceId: 'DEVICE_ABC',
  accessToken: 'access-token-1',
  homeserverUrl: HOMESERVER,
  ...overrides,
});

export { HOMESERVER, setMatrixHomeserver, makeCredentialRecord };
