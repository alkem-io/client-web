import { describe, expect, it } from 'vitest';
import { redactBreadcrumb, redactString, redactValue } from './redaction';

const ACCESS_TOKEN = 'syt_dXNlcl9hbGljZQ_SomeRandomAccessToken_1a2B3c';
const REFRESH_TOKEN = 'syr_dXNlcl9hbGljZQ_SomeRandomRefreshToken_4d5E6f';
const LOGIN_TOKEN = 'mlt_abc123def456';

describe('redaction', () => {
  describe('redactString', () => {
    it('redacts access_token in query strings', () => {
      const url = `https://matrix.example.com/_matrix/client/v3/sync?access_token=${ACCESS_TOKEN}&timeout=30000`;
      const result = redactString(url);
      expect(result).toContain('access_token=[REDACTED]');
      expect(result).not.toContain(ACCESS_TOKEN);
    });

    it('redacts refresh_token in query strings', () => {
      const url = `https://matrix.example.com/refresh?refresh_token=${REFRESH_TOKEN}`;
      const result = redactString(url);
      expect(result).toContain('refresh_token=[REDACTED]');
      expect(result).not.toContain(REFRESH_TOKEN);
    });

    it('redacts loginToken in query strings', () => {
      const url = `https://app.example.com/matrix-callback?loginToken=${LOGIN_TOKEN}`;
      const result = redactString(url);
      expect(result).toContain('loginToken=[REDACTED]');
      expect(result).not.toContain(LOGIN_TOKEN);
    });

    it('redacts Bearer tokens in headers', () => {
      const header = `Bearer ${ACCESS_TOKEN}`;
      const result = redactString(header);
      expect(result).toBe('Bearer [REDACTED]');
      expect(result).not.toContain(ACCESS_TOKEN);
    });

    it('redacts JSON-embedded tokens', () => {
      const json = `{"access_token": "${ACCESS_TOKEN}", "refresh_token": "${REFRESH_TOKEN}"}`;
      const result = redactString(json);
      expect(result).not.toContain(ACCESS_TOKEN);
      expect(result).not.toContain(REFRESH_TOKEN);
      expect(result).toContain('"access_token": "[REDACTED]"');
      expect(result).toContain('"refresh_token": "[REDACTED]"');
    });

    it('redacts multiple tokens in one string', () => {
      const mixed = `access_token=${ACCESS_TOKEN}&loginToken=${LOGIN_TOKEN} with Bearer ${REFRESH_TOKEN}`;
      const result = redactString(mixed);
      expect(result).not.toContain(ACCESS_TOKEN);
      expect(result).not.toContain(LOGIN_TOKEN);
      expect(result).not.toContain(REFRESH_TOKEN);
    });

    it('leaves non-sensitive strings untouched', () => {
      const safe = 'User logged in successfully from 192.168.1.1';
      expect(redactString(safe)).toBe(safe);
    });
  });

  describe('redactValue', () => {
    it('redacts known token keys in objects', () => {
      const payload = {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
        loginToken: LOGIN_TOKEN,
        userId: '@user:example.com',
        deviceId: 'ABCDEF',
      };
      const result = redactValue(payload) as Record<string, unknown>;
      expect(result.accessToken).toBe('[REDACTED]');
      expect(result.refreshToken).toBe('[REDACTED]');
      expect(result.loginToken).toBe('[REDACTED]');
      expect(result.userId).toBe('@user:example.com');
      expect(result.deviceId).toBe('ABCDEF');
    });

    it('redacts snake_case token keys in objects', () => {
      const payload = { access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN };
      const result = redactValue(payload) as Record<string, unknown>;
      expect(result.access_token).toBe('[REDACTED]');
      expect(result.refresh_token).toBe('[REDACTED]');
    });

    it('recurses into nested objects', () => {
      const nested = { outer: { accessToken: ACCESS_TOKEN, safe: 'ok' } };
      const result = redactValue(nested) as Record<string, Record<string, unknown>>;
      expect(result.outer.accessToken).toBe('[REDACTED]');
      expect(result.outer.safe).toBe('ok');
    });

    it('recurses into arrays', () => {
      const arr = [{ accessToken: ACCESS_TOKEN }, 'safe'];
      const result = redactValue(arr) as unknown[];
      expect((result[0] as Record<string, unknown>).accessToken).toBe('[REDACTED]');
      expect(result[1]).toBe('safe');
    });

    it('passes through primitives', () => {
      expect(redactValue(42)).toBe(42);
      expect(redactValue(null)).toBe(null);
      expect(redactValue(undefined)).toBe(undefined);
      expect(redactValue(true)).toBe(true);
    });
  });

  describe('redactBreadcrumb', () => {
    it('redacts tokens in message and data', () => {
      const breadcrumb = {
        message: `Sync failed with Bearer ${ACCESS_TOKEN}`,
        data: {
          accessToken: ACCESS_TOKEN,
          url: `https://matrix.example.com?access_token=${ACCESS_TOKEN}`,
          status: 401,
        },
      };
      const result = redactBreadcrumb(breadcrumb);
      expect(result.message).not.toContain(ACCESS_TOKEN);
      expect(JSON.stringify(result.data)).not.toContain(ACCESS_TOKEN);
      expect(result.data?.status).toBe(401);
    });

    it('preserves breadcrumb fields not subject to redaction', () => {
      const breadcrumb = {
        message: 'State transition: idle → starting',
        data: { from: 'idle', to: 'starting' },
      };
      const result = redactBreadcrumb(breadcrumb);
      expect(result.message).toBe('State transition: idle → starting');
      expect(result.data).toEqual({ from: 'idle', to: 'starting' });
    });
  });
});
