import { EventEmitter } from 'node:events';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Drives the real watcher, call stores, tab badge and header count together, with only the
// Matrix client, GraphQL and the context around them faked. Each "tab" gets fresh module
// instances, as a browser tab would, and shares only the window and its localStorage.

const harness = vi.hoisted(() => ({ client: null as unknown }));

const me = { id: 'me', type: 'USER', profile: { displayName: 'Me' } };
const ana = { id: 'ana', type: 'USER', profile: { displayName: 'Ana' } };
const directConversation = { id: 'c1', room: { id: 'direct', type: 'CONVERSATION_DIRECT' }, members: [me, ana] };

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsQuery: ({ skip }: { skip: boolean }) => ({
    data: skip ? undefined : { me: { conversations: { conversations: [directConversation] } } },
  }),
  useUserConversationsUnreadCountQuery: ({ skip }: { skip: boolean }) => ({
    data: skip ? undefined : { me: { conversations: { conversations: [directConversation] } } },
  }),
}));
vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformRoles: ['FEATURE_BETA_TESTER'], userModel: { id: 'me' } }),
}));
vi.mock('@/main/guidance/chatWidget/useGuidanceVcId', () => ({ useGuidanceVcId: () => ({ guidanceVcId: null }) }));
vi.mock('@/main/userMessaging/calls/callConfig', () => ({ isCallsConfigured: () => true }));
vi.mock('@/main/userMessaging/matrix/matrixRooms', () => ({
  CLIENT_ROOM: 'Room',
  CLIENT_SYNC: 'sync',
  resolveMatrixRoomId: async (_client: unknown, alkemioRoomId: string) => `!${alkemioRoomId}:hs`,
}));
vi.mock('@/main/userMessaging/matrix/conversationSummaryStore', () => ({
  useConversationSummaries: () => null,
  displayedUnreadCount: () => 0,
}));
vi.mock('@/main/inAppNotifications/useUnreadNotificationsCount', () => ({ useUnreadNotificationsCount: () => 0 }));
vi.mock('@/main/tabBadge/faviconBadge', () => ({ setFaviconBadge: vi.fn(), clearFaviconBadge: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, values?: { name?: string }) => `${key}:${values?.name}` }),
}));
// Each tab has its own title; the real tabs do not share a document. Registered per tab in
// openTab, since a hoisted mock's factory is not run again after resetModules.
const tabDocumentTitle = () => {
  let prefix = '';
  let override: string | null = null;
  return {
    setBaseTitle: () => {},
    setTitlePrefix: (next: string) => {
      prefix = next;
    },
    setTitleOverride: (next: string | null) => {
      override = next;
    },
    tabTitle: () => `${prefix}${override ?? 'Alkemio'}`,
  };
};
// The conversation open in a tab comes from that tab's own provider.
vi.mock('@/main/userMessaging/UserMessagingContext', async () => {
  const { createContext, useContext } = await import('react');
  const TabContext = createContext<string | null>(null);
  return {
    TabContext,
    useUserMessagingContext: () => ({ isEnabled: true, isOpen: false, selectedRoomId: useContext(TabContext) }),
  };
});

type FakeMembership = {
  sender: string;
  deviceId: string;
  createdTs(): number;
  isExpired(): boolean;
  getMsUntilExpiry(): number;
};

const membership = (sender: string, createdTs: number): FakeMembership => ({
  sender,
  deviceId: 'D',
  createdTs: () => createdTs,
  isExpired: () => false,
  getMsUntilExpiry: () => 3_600_000,
});

class FakeSession extends EventEmitter {
  memberships: FakeMembership[] = [];
}

const session = new FakeSession();
const makeClient = () =>
  Object.assign(new EventEmitter(), {
    matrixRTC: Object.assign(new EventEmitter(), { getRoomSession: () => session }),
    getRoom: (roomId: string) => ({ roomId }),
    getUserId: () => '@me:hs',
    getSyncState: () => 'SYNCING',
  });

const setMemberships = (memberships: FakeMembership[]) =>
  act(() => {
    session.memberships = memberships;
    session.emit('memberships_changed');
  });

const CALL_TITLE = 'call.callingYou:Ana';

/** Mounts one tab: its own module instances, with the conversation open in it under its control. */
const openTab = async () => {
  vi.resetModules();
  const documentTitle = tabDocumentTitle();
  vi.doMock('@/core/routing/documentTitle', () => documentTitle);
  const { useIncomingCallsWatcher } = await import('./useIncomingCallsWatcher');
  const { useUnreadTabBadge } = await import('@/main/tabBadge/useUnreadTabBadge');
  const { useUnreadConversationsCount } = await import('@/main/userMessaging/useUnreadConversationsCount');
  const { getIncomingCallRooms } = await import('./incomingCallStore');
  const { tabTitle } = documentTitle;
  const { TabContext } = (await import('@/main/userMessaging/UserMessagingContext')) as unknown as {
    TabContext: React.Context<string | null>;
  };
  let selectedRoomId: string | null = null;
  const view = renderHook(
    () => {
      useIncomingCallsWatcher();
      useUnreadTabBadge();
      return useUnreadConversationsCount();
    },
    {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(TabContext, { value: selectedRoomId }, children),
    }
  );
  await act(async () => {
    vi.advanceTimersByTime(2000);
  });
  await act(async () => {});
  return {
    /** Whether this tab's title, header count and store all show the call. */
    alerting: () => {
      // The title alternates, so it is checked over one full switch.
      act(() => {});
      let inTitle = tabTitle().includes(CALL_TITLE);
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      inTitle ||= tabTitle().includes(CALL_TITLE);
      const inStore = getIncomingCallRooms().has('direct');
      const inCount = view.result.current > 0;
      expect(new Set([inTitle, inStore, inCount]).size, 'title, store and header count disagree').toBe(1);
      return inStore;
    },
    select: (roomId: string | null) =>
      act(() => {
        selectedRoomId = roomId;
        view.rerender();
      }),
    unmount: view.unmount,
  };
};

let documentActive = true;
const setDocumentActive = (active: boolean) =>
  act(() => {
    documentActive = active;
    window.dispatchEvent(new Event(active ? 'focus' : 'blur'));
  });

describe('the incoming-call alert', () => {
  let tabs: Awaited<ReturnType<typeof openTab>>[] = [];
  const tab = async () => {
    const opened = await openTab();
    tabs.push(opened);
    return opened;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    harness.client = makeClient();
    session.memberships = [membership('@ana:hs', 1_000)];
    documentActive = true;
    vi.spyOn(document, 'hasFocus').mockImplementation(() => documentActive);
  });
  afterEach(() => {
    for (const opened of tabs) {
      opened.unmount();
    }
    tabs = [];
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('alerts for a call the user has not dealt with', async () => {
    const tabA = await tab();
    expect(tabA.alerting()).toBe(true);
  });

  it('stops in every tab once the conversation is opened in one of them, and stays stopped after it is closed', async () => {
    const tabB = await tab();
    const tabA = await tab();
    expect(tabB.alerting()).toBe(true);

    tabA.select('direct');
    expect(tabA.alerting()).toBe(false);
    // Another tab hears of the change through the storage event, which the browser fires there.
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: window.localStorage.key(0) }));
    });
    expect(tabB.alerting()).toBe(false);

    tabA.select(null);
    expect(tabA.alerting()).toBe(false);
  });

  it('does not count a conversation left open in a background tab as seen', async () => {
    const tabB = await tab();
    const tabA = await tab();
    setDocumentActive(false);
    tabA.select('direct');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(tabA.alerting()).toBe(false);
    expect(tabB.alerting()).toBe(true);

    setDocumentActive(true);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(tabB.alerting()).toBe(false);
  });

  it('does not alert again after the user joins and then leaves, while others stay in', async () => {
    const tabA = await tab();
    setMemberships([membership('@ana:hs', 1_000), membership('@me:hs', 2_000)]);
    expect(tabA.alerting()).toBe(false);

    setMemberships([membership('@ana:hs', 1_000)]);
    expect(tabA.alerting()).toBe(false);
  });

  it('still knows the call once everyone who was in it back then has left', async () => {
    const tabA = await tab();
    tabA.select('direct');
    tabA.select(null);
    setMemberships([membership('@ana:hs', 1_000), membership('@bo:hs', 3_000)]);
    setMemberships([membership('@bo:hs', 3_000)]);
    expect(tabA.alerting()).toBe(false);
  });

  it('alerts again for a new call in the same conversation', async () => {
    const tabA = await tab();
    tabA.select('direct');
    tabA.select(null);
    setMemberships([]);
    expect(tabA.alerting()).toBe(false);

    setMemberships([membership('@ana:hs', 9_000)]);
    expect(tabA.alerting()).toBe(true);
  });

  it('works within the tab when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const tabA = await tab();
    expect(tabA.alerting()).toBe(true);

    setMemberships([membership('@ana:hs', 1_000), membership('@me:hs', 2_000)]);
    setMemberships([membership('@ana:hs', 1_000)]);
    expect(tabA.alerting()).toBe(false);

    setMemberships([membership('@ana:hs', 9_000)]);
    expect(tabA.alerting()).toBe(true);
    tabA.select('direct');
    tabA.select(null);
    expect(tabA.alerting()).toBe(false);
  });
});
