import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ACTOR_ID = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890';
const OTHER_ID = '00000000-0000-0000-0000-000000000001';
const HOMESERVER = 'https://matrix.dev-alkem.io';

const setEnv = (overrides: Record<string, string | undefined> = {}) => {
  const base: Record<string, string | undefined> = {
    VITE_APP_MATRIX_ENABLED: 'true',
    VITE_APP_MATRIX_HOMESERVER_URL: HOMESERVER,
    VITE_APP_MATRIX_ALLOWED_USERS: '',
  };
  Object.assign(base, overrides);

  Object.defineProperty(window, '_env_', {
    value: base,
    writable: true,
    configurable: true,
  });
};

describe('matrixConfig', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)._env_;
  });

  const importFresh = () => import('./matrixConfig');

  describe('getConfig', () => {
    it('parses a fully configured environment', async () => {
      setEnv({ VITE_APP_MATRIX_ALLOWED_USERS: `${ACTOR_ID}, ${OTHER_ID}` });
      const { getConfig } = await importFresh();
      const config = getConfig();

      expect(config.enabled).toBe(true);
      expect(config.homeserverUrl).toBe(HOMESERVER);
      expect(config.allowedUsers).toEqual([ACTOR_ID.toLowerCase(), OTHER_ID.toLowerCase()]);
    });

    it('treats missing _env_ as fully disabled', async () => {
      const { getConfig } = await importFresh();
      const config = getConfig();

      expect(config.enabled).toBe(false);
      expect(config.homeserverUrl).toBe('');
      expect(config.allowedUsers).toEqual([]);
    });
  });

  describe('isAdmitted — table-driven', () => {
    const cases: {
      name: string;
      env: Record<string, string | undefined>;
      actorId: string | undefined | null;
      expected: boolean;
    }[] = [
      {
        name: 'off → not admitted',
        env: { VITE_APP_MATRIX_ENABLED: 'false' },
        actorId: ACTOR_ID,
        expected: false,
      },
      {
        name: 'enabled absent → not admitted',
        env: { VITE_APP_MATRIX_ENABLED: undefined },
        actorId: ACTOR_ID,
        expected: false,
      },
      {
        name: 'enabled=TRUE (case-insensitive) → admitted',
        env: { VITE_APP_MATRIX_ENABLED: 'TRUE' },
        actorId: ACTOR_ID,
        expected: true,
      },
      {
        name: 'empty homeserver URL → not admitted',
        env: { VITE_APP_MATRIX_HOMESERVER_URL: '' },
        actorId: ACTOR_ID,
        expected: false,
      },
      {
        name: 'missing homeserver URL → not admitted',
        env: { VITE_APP_MATRIX_HOMESERVER_URL: undefined },
        actorId: ACTOR_ID,
        expected: false,
      },
      {
        name: 'whitespace-only homeserver URL → not admitted',
        env: { VITE_APP_MATRIX_HOMESERVER_URL: '   ' },
        actorId: ACTOR_ID,
        expected: false,
      },
      {
        name: 'empty allowlist → all admitted',
        env: { VITE_APP_MATRIX_ALLOWED_USERS: '' },
        actorId: ACTOR_ID,
        expected: true,
      },
      {
        name: 'allowlist absent → all admitted',
        env: { VITE_APP_MATRIX_ALLOWED_USERS: undefined },
        actorId: ACTOR_ID,
        expected: true,
      },
      {
        name: 'actor in allowlist → admitted',
        env: { VITE_APP_MATRIX_ALLOWED_USERS: `${OTHER_ID}, ${ACTOR_ID}` },
        actorId: ACTOR_ID,
        expected: true,
      },
      {
        name: 'actor NOT in allowlist → not admitted',
        env: { VITE_APP_MATRIX_ALLOWED_USERS: OTHER_ID },
        actorId: ACTOR_ID,
        expected: false,
      },
      {
        name: 'case-insensitive UUID compare',
        env: { VITE_APP_MATRIX_ALLOWED_USERS: ACTOR_ID.toLowerCase() },
        actorId: ACTOR_ID.toUpperCase(),
        expected: true,
      },
      {
        name: 'whitespace around UUIDs is tolerated',
        env: { VITE_APP_MATRIX_ALLOWED_USERS: `  ${ACTOR_ID}  ,  ${OTHER_ID}  ` },
        actorId: ACTOR_ID,
        expected: true,
      },
      {
        name: 'undefined actorId → not admitted',
        env: {},
        actorId: undefined,
        expected: false,
      },
      {
        name: 'null actorId → not admitted',
        env: {},
        actorId: null,
        expected: false,
      },
      {
        name: 'empty string actorId → not admitted',
        env: {},
        actorId: '',
        expected: false,
      },
      {
        name: 'malformed enabled value → not admitted',
        env: { VITE_APP_MATRIX_ENABLED: 'yes' },
        actorId: ACTOR_ID,
        expected: false,
      },
    ];

    for (const { name, env: overrides, actorId, expected } of cases) {
      it(name, async () => {
        setEnv(overrides);
        const { isAdmitted } = await importFresh();
        expect(isAdmitted(actorId)).toBe(expected);
      });
    }
  });
});
