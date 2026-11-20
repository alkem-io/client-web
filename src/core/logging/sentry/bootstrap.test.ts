import * as Sentry from '@sentry/react';
import { afterEach, describe, expect, it } from 'vitest';
import bootstrap from './bootstrap';

// Regression test for duplicate Sentry initialisation. `SentryErrorBoundaryProvider` calls
// `bootstrap` from its render body, so it runs on every re-render. Each `Sentry.init` built a new
// client and registered another global fetch instrumentation handler, so a single real request
// was recorded as N `http.client` spans (N = render count). Sentry's performance detector then
// raised those as "N+1 API Call" issues on every page (/home, /login, /registration, ...).
// `bootstrap` must therefore be idempotent: the first enabled call initialises, later calls keep
// that client.

// Unroutable port so the session envelope Sentry sends on init fails fast instead of leaving
// the test process.
const DSN = 'http://public@127.0.0.1:9/1';

afterEach(async () => {
  await Sentry.getClient()?.close(0);
});

describe('sentry bootstrap', () => {
  it('keeps the first client when called again on a re-render', () => {
    bootstrap(true, DSN, 'test');
    const firstClient = Sentry.getClient();

    bootstrap(true, DSN, 'test');

    expect(firstClient).toBeDefined();
    expect(Sentry.getClient()).toBe(firstClient);
  });
});
