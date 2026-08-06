import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `public/service-worker.js` is shipped verbatim (never bundled), so it cannot be
 * imported. It is evaluated here against a stub `self`, which is also the only
 * way to exercise the worker's registered event listeners.
 */
type SwEventListener = (event: unknown) => void;

type WindowClientStub = {
  url: string;
  focused?: boolean;
  visibilityState?: string;
  focus: () => Promise<void>;
  navigate: (url: string) => Promise<void>;
};

const ORIGIN = 'https://alkem.io';

let listeners: Record<string, SwEventListener>;
let showNotification: ReturnType<typeof vi.fn>;
let matchAll: ReturnType<typeof vi.fn>;
let openWindow: ReturnType<typeof vi.fn>;

const loadServiceWorker = () => {
  listeners = {};
  showNotification = vi.fn();
  matchAll = vi.fn(() => Promise.resolve([] as WindowClientStub[]));
  openWindow = vi.fn(() => Promise.resolve());

  const selfStub = {
    addEventListener: (type: string, handler: SwEventListener) => {
      listeners[type] = handler;
    },
    skipWaiting: vi.fn(),
    location: { origin: ORIGIN },
    registration: { showNotification, pushManager: { subscribe: vi.fn() } },
    clients: { matchAll, openWindow, claim: vi.fn() },
  };

  const source = readFileSync(resolve(process.cwd(), 'public/service-worker.js'), 'utf8');
  new Function('self', 'fetch', source)(selfStub, vi.fn());
};

const firePush = (payload: unknown) => {
  const waitUntil = vi.fn();
  listeners.push({ data: { json: () => payload }, waitUntil });
  return waitUntil;
};

const fireNotificationClick = async (url: string) => {
  let pending: Promise<unknown> = Promise.resolve();
  listeners.notificationclick({
    notification: { close: vi.fn(), data: { url } },
    waitUntil: (promise: Promise<unknown>) => {
      pending = promise;
    },
  });
  await pending;
};

const windowClient = (overrides: Partial<WindowClientStub> & { url: string }): WindowClientStub => ({
  focus: vi.fn(() => Promise.resolve()),
  navigate: vi.fn(() => Promise.resolve()),
  ...overrides,
});

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  loadServiceWorker();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** FR-024 / contract C-4 — a newer digest replaces the previous one. */
describe('service worker push — notification tag (FR-024)', () => {
  it('uses the tag supplied by the push payload so digests collapse', () => {
    firePush({
      title: 'New messages',
      body: '3 messages in 2 conversations',
      url: '/messages?chat=abc',
      eventType: 'COMMUNICATION_MESSAGE_DIGEST',
      tag: 'messaging-direct-digest',
    });

    expect(showNotification).toHaveBeenCalledWith(
      'New messages',
      expect.objectContaining({ tag: 'messaging-direct-digest' })
    );
  });

  it('replays the same tag across dispatches, so the OS replaces rather than stacks', () => {
    firePush({ title: 'A', body: 'a', url: '/x', eventType: 'DIGEST', tag: 'messaging-direct-digest' });
    firePush({ title: 'B', body: 'b', url: '/x', eventType: 'DIGEST', tag: 'messaging-direct-digest' });

    const tags = showNotification.mock.calls.map(([, options]) => options.tag);
    expect(tags).toEqual(['messaging-direct-digest', 'messaging-direct-digest']);
  });

  it('falls back to the legacy unique tag when the payload carries none', () => {
    firePush({ title: 'Invite', body: 'You were invited', url: '/invite', eventType: 'COMMUNITY_INVITATION' });

    expect(showNotification).toHaveBeenCalledWith(
      'Invite',
      expect.objectContaining({ tag: `COMMUNITY_INVITATION-${Date.now()}` })
    );
  });

  it('falls back when the payload tag is empty, rather than tagging everything the same', () => {
    firePush({ title: 'Invite', body: 'b', url: '/invite', eventType: 'COMMUNITY_INVITATION', tag: '' });

    expect(showNotification).toHaveBeenCalledWith(
      'Invite',
      expect.objectContaining({ tag: `COMMUNITY_INVITATION-${Date.now()}` })
    );
  });

  it('still passes body, icons and the deep-link data through', () => {
    firePush({ title: 'T', body: 'B', url: '/messages?chat=abc', eventType: 'DIGEST', tag: 'digest' });

    expect(showNotification).toHaveBeenCalledWith('T', {
      body: 'B',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: '/messages?chat=abc' },
      tag: 'digest',
    });
  });

  it('ignores a push with no data at all', () => {
    listeners.push({ waitUntil: vi.fn() });
    expect(showNotification).not.toHaveBeenCalled();
  });
});

describe('service worker notificationclick — target window selection', () => {
  it('navigates the focused window rather than the first same-origin one', async () => {
    const background = windowClient({ url: `${ORIGIN}/spaces`, focused: false, visibilityState: 'hidden' });
    const foreground = windowClient({ url: `${ORIGIN}/home`, focused: true, visibilityState: 'visible' });
    matchAll.mockResolvedValue([background, foreground]);

    await fireNotificationClick('/messages?chat=abc');

    expect(foreground.navigate).toHaveBeenCalledWith(`${ORIGIN}/messages?chat=abc`);
    expect(background.navigate).not.toHaveBeenCalled();
  });

  it('prefers a visible window when none is focused', async () => {
    const hidden = windowClient({ url: `${ORIGIN}/spaces`, focused: false, visibilityState: 'hidden' });
    const visible = windowClient({ url: `${ORIGIN}/home`, focused: false, visibilityState: 'visible' });
    matchAll.mockResolvedValue([hidden, visible]);

    await fireNotificationClick('/messages');

    expect(visible.navigate).toHaveBeenCalled();
    expect(hidden.navigate).not.toHaveBeenCalled();
  });

  it('falls back to the first same-origin window when none is focused or visible', async () => {
    const first = windowClient({ url: `${ORIGIN}/spaces`, focused: false, visibilityState: 'hidden' });
    const second = windowClient({ url: `${ORIGIN}/home`, focused: false, visibilityState: 'hidden' });
    matchAll.mockResolvedValue([first, second]);

    await fireNotificationClick('/messages');

    expect(first.navigate).toHaveBeenCalled();
    expect(second.navigate).not.toHaveBeenCalled();
  });

  it('ignores cross-origin windows and opens a new one', async () => {
    matchAll.mockResolvedValue([windowClient({ url: 'https://example.com/x', focused: true })]);

    await fireNotificationClick('/messages');

    expect(openWindow).toHaveBeenCalledWith(`${ORIGIN}/messages`);
  });
});
