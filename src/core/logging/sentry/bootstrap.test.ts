import * as Sentry from '@sentry/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALKEMIO_COOKIE_NAME } from '@/main/cookies/useAlkemioCookies';
import bootstrap from './bootstrap';

// Regression test for duplicate Sentry initialisation. `SentryErrorBoundaryProvider` calls
// `bootstrap` from its render body, so it runs on every re-render. Each `Sentry.init` built a new
// client and registered another global fetch instrumentation handler, so a single real request
// was recorded as N `http.client` spans (N = render count). Sentry's performance detector then
// raised those as "N+1 API Call" issues on every page (/home, /login, /registration, ...).
// `bootstrap` must therefore be idempotent: the first enabled call initialises, later calls keep
// that client.

// What reaches the network: bootstrap wraps this transport, so whatever it is handed was sent.
const { sent } = vi.hoisted(() => ({ sent: vi.fn((_envelope: unknown) => Promise.resolve({})) }));
vi.mock('@sentry/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@sentry/react')>()),
  makeFetchTransport: () => ({ send: sent, flush: () => Promise.resolve(true) }),
}));

const DSN = 'http://public@127.0.0.1:9/1';

let browserCookies = '';
const writeConsent = (value: string) => {
  browserCookies = `${ALKEMIO_COOKIE_NAME}=${encodeURIComponent(value)}`;
};
const ACCEPTED = JSON.stringify(['technical', 'analysis']);
const ONLY_NECESSARY = JSON.stringify(['technical']);

const sessionsSent = () =>
  sent.mock.calls.filter(([envelope]) => JSON.stringify(envelope).includes('"type":"session"')).length;
const sampleRate = () =>
  Sentry.getClient()
    ?.getOptions()
    .tracesSampler?.({ name: 'navigation', inheritOrSampleWith: rate => rate });
const keepsBreadcrumb = () => {
  Sentry.getIsolationScope().clearBreadcrumbs();
  Sentry.addBreadcrumb({ message: 'clicked' });
  return Sentry.getIsolationScope().getScopeData().breadcrumbs.length === 1;
};
// What the BrowserSession integration does on load and on every navigation. Its own load-time call
// runs on the first init in the process only, so each test starts the page session itself.
const startPageSession = () => {
  sent.mockClear();
  Sentry.startSession({ ignoreDuration: true });
  Sentry.captureSession();
};

beforeEach(() => {
  sent.mockClear();
  browserCookies = '';
  vi.spyOn(document, 'cookie', 'get').mockImplementation(() => browserCookies);
});

afterEach(async () => {
  await Sentry.getClient()?.close(0);
  Sentry.getCurrentScope().setClient(undefined);
  Sentry.getCurrentScope().clear();
  Sentry.getIsolationScope().clear();
  Reflect.deleteProperty(window, 'Capacitor');
  vi.restoreAllMocks();
});

describe('sentry bootstrap', () => {
  it('keeps the first client when called again on a re-render', () => {
    bootstrap(true, DSN, 'test');
    const firstClient = Sentry.getClient();

    bootstrap(true, DSN, 'test');

    expect(firstClient).toBeDefined();
    expect(Sentry.getClient()).toBe(firstClient);
  });

  it('tags browser traffic as web', () => {
    bootstrap(true, DSN, 'test');

    expect(Sentry.getCurrentScope().getScopeData().tags).toEqual({ app_mode: false, app_platform: 'web' });
  });

  it('tags app-shell traffic with the native platform', () => {
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios' };

    bootstrap(true, DSN, 'test');

    expect(Sentry.getCurrentScope().getScopeData().tags).toEqual({ app_mode: true, app_platform: 'ios' });
  });
});

describe('sentry bootstrap consent gate', () => {
  it('without a consent cookie sends no transactions, breadcrumbs or sessions', () => {
    bootstrap(true, DSN, 'test');
    startPageSession();

    expect(sampleRate()).toBe(0);
    expect(keepsBreadcrumb()).toBe(false);
    expect(sessionsSent()).toBe(0);
  });

  it('with "Only necessary" sends no transactions, breadcrumbs or sessions', () => {
    writeConsent(ONLY_NECESSARY);
    bootstrap(true, DSN, 'test');
    startPageSession();

    expect(sampleRate()).toBe(0);
    expect(keepsBreadcrumb()).toBe(false);
    expect(sessionsSent()).toBe(0);
  });

  it('treats a malformed consent cookie as no consent', () => {
    writeConsent('[analysis');
    bootstrap(true, DSN, 'test');
    startPageSession();

    expect(sampleRate()).toBe(0);
    expect(keepsBreadcrumb()).toBe(false);
    expect(sessionsSent()).toBe(0);
  });

  it('with analysis consent samples 20% of traces, keeps breadcrumbs and sends sessions', () => {
    writeConsent(ACCEPTED);
    bootstrap(true, DSN, 'test');
    startPageSession();

    expect(sampleRate()).toBe(0.2);
    expect(keepsBreadcrumb()).toBe(true);
    expect(sessionsSent()).toBe(1);
  });

  it('follows consent given after init on the next call', () => {
    bootstrap(true, DSN, 'test');

    writeConsent(ACCEPTED);
    startPageSession();

    expect(sampleRate()).toBe(0.2);
    expect(keepsBreadcrumb()).toBe(true);
    expect(sessionsSent()).toBe(1);
  });

  it('follows consent withdrawn after init on the next call', () => {
    writeConsent(ACCEPTED);
    bootstrap(true, DSN, 'test');

    writeConsent(ONLY_NECESSARY);
    startPageSession();

    expect(sampleRate()).toBe(0);
    expect(keepsBreadcrumb()).toBe(false);
    expect(sessionsSent()).toBe(0);
  });

  it('drops breadcrumbs kept before a withdrawal from later error events', async () => {
    writeConsent(ACCEPTED);
    bootstrap(true, DSN, 'test');
    Sentry.addBreadcrumb({ message: 'visited /space/secret' });

    writeConsent(ONLY_NECESSARY);
    sent.mockClear();
    Sentry.captureException(new Error('boom'));
    await Sentry.flush(0);

    const events = sent.mock.calls
      .map(([envelope]) => JSON.stringify(envelope))
      .filter(e => e.includes('"type":"event"'));
    expect(events).toHaveLength(1);
    expect(events[0]).not.toContain('visited /space/secret');
  });

  it('drops a transaction that finishes after consent was withdrawn, and sends it with consent', async () => {
    writeConsent(ACCEPTED);
    bootstrap(true, DSN, 'test');
    const transport = Sentry.getClient()?.getTransport();
    type Envelope = Parameters<NonNullable<typeof transport>['send']>[0];
    const transaction = [{}, [[{ type: 'transaction' }, {}]]] as unknown as Envelope;
    sent.mockClear();

    await transport?.send(transaction);
    expect(sent).toHaveBeenCalledTimes(1);

    // Sampled while consent was given, finished after the withdrawal.
    writeConsent(ONLY_NECESSARY);
    await transport?.send(transaction);
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it('sends error events without consent', async () => {
    bootstrap(true, DSN, 'test');

    Sentry.captureException(new Error('boom'));
    await Sentry.flush(0);

    expect(sent.mock.calls.some(([envelope]) => JSON.stringify(envelope).includes('"type":"event"'))).toBe(true);
  });
});
