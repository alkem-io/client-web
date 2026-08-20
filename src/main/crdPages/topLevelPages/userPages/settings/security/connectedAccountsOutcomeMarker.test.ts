import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearConnectedAccountsMarker,
  consumeConnectedAccountsMarker,
  readConnectedAccountsMarker,
  resolveMarkerOutcome,
  writeConnectedAccountsMarker,
} from './connectedAccountsOutcomeMarker';

const STORAGE_KEY = 'alkemio.connectedAccounts.outcomeMarker';
const TWO_MINUTES_MS = 2 * 60 * 1000;

describe('connectedAccountsOutcomeMarker (FR-012 fallback — research D5)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('write / read / clear', () => {
    test('a freshly written marker reads back with the same action and provider', () => {
      writeConnectedAccountsMarker('unlink', 'github');

      const marker = readConnectedAccountsMarker();

      expect(marker).toMatchObject({ action: 'unlink', provider: 'github' });
      expect(typeof marker?.ts).toBe('number');
    });

    test('read does not clear the marker', () => {
      writeConnectedAccountsMarker('link', 'microsoft');

      readConnectedAccountsMarker();

      expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    test('clear removes the marker', () => {
      writeConnectedAccountsMarker('link', 'microsoft');

      clearConnectedAccountsMarker();

      expect(readConnectedAccountsMarker()).toBeNull();
    });

    test('clear is a no-op when nothing was written', () => {
      expect(() => clearConnectedAccountsMarker()).not.toThrow();
      expect(readConnectedAccountsMarker()).toBeNull();
    });

    test('reading with no marker present returns null', () => {
      expect(readConnectedAccountsMarker()).toBeNull();
    });

    test('a malformed entry is treated as absent, not thrown', () => {
      sessionStorage.setItem(STORAGE_KEY, '{not json');
      expect(readConnectedAccountsMarker()).toBeNull();

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'link' }));
      expect(readConnectedAccountsMarker()).toBeNull();

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'orbit', provider: 'github', ts: Date.now() }));
      expect(readConnectedAccountsMarker()).toBeNull();

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'link', provider: '', ts: Date.now() }));
      expect(readConnectedAccountsMarker()).toBeNull();
    });
  });

  describe('age bound', () => {
    test('a marker just under the age bound is fresh', () => {
      const writtenAt = 1_000_000;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'link', provider: 'github', ts: writtenAt }));

      const marker = readConnectedAccountsMarker(writtenAt + TWO_MINUTES_MS - 1);

      expect(marker).not.toBeNull();
    });

    test('a marker past the age bound is stale, not returned', () => {
      const writtenAt = 1_000_000;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'link', provider: 'github', ts: writtenAt }));

      const marker = readConnectedAccountsMarker(writtenAt + TWO_MINUTES_MS + 1);

      expect(marker).toBeNull();
    });

    test('a marker timestamped in the future is untrustworthy, not returned', () => {
      const now = 1_000_000;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'link', provider: 'github', ts: now + 5_000 }));

      expect(readConnectedAccountsMarker(now)).toBeNull();
    });
  });

  describe('consume', () => {
    test('returns the marker and clears it in the same call', () => {
      writeConnectedAccountsMarker('unlink', 'github');

      const marker = consumeConnectedAccountsMarker();

      expect(marker).toMatchObject({ action: 'unlink', provider: 'github' });
      expect(readConnectedAccountsMarker()).toBeNull();
    });

    test('a second consume call finds nothing left to read', () => {
      writeConnectedAccountsMarker('link', 'microsoft');
      consumeConnectedAccountsMarker();

      expect(consumeConnectedAccountsMarker()).toBeNull();
    });

    test('consuming a stale marker still clears it, and returns null', () => {
      const writtenAt = 1_000_000;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ action: 'link', provider: 'github', ts: writtenAt }));

      const marker = consumeConnectedAccountsMarker(writtenAt + TWO_MINUTES_MS + 1);

      expect(marker).toBeNull();
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('resolveMarkerOutcome', () => {
    test('null marker resolves to null regardless of state', () => {
      expect(resolveMarkerOutcome(null, 'connected')).toBeNull();
    });

    test('link marker + provider now connected → linked', () => {
      const marker = { action: 'link' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'connected')).toBe('linked');
    });

    test('link marker + provider now connected-locked → linked (still a successful link)', () => {
      const marker = { action: 'link' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'connected-locked')).toBe('linked');
    });

    test('link marker + provider still not-connected → failed', () => {
      const marker = { action: 'link' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'not-connected')).toBe('failed');
    });

    test('link marker + provider absent from the reloaded list → failed', () => {
      const marker = { action: 'link' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'absent')).toBe('failed');
    });

    test('unlink marker + provider now not-connected → unlinked', () => {
      const marker = { action: 'unlink' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'not-connected')).toBe('unlinked');
    });

    test('unlink marker + provider absent from the reloaded list → unlinked', () => {
      const marker = { action: 'unlink' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'absent')).toBe('unlinked');
    });

    test('unlink marker + provider still connected → failed', () => {
      const marker = { action: 'unlink' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'connected')).toBe('failed');
    });

    test('unlink marker + provider now connected-locked → failed (not the requested outcome)', () => {
      const marker = { action: 'unlink' as const, provider: 'github', ts: Date.now() };
      expect(resolveMarkerOutcome(marker, 'connected-locked')).toBe('failed');
    });
  });
});
