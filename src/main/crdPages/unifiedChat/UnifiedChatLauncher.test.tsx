import { EventEmitter } from 'node:events';
import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { UnifiedChatLauncher } from './UnifiedChatLauncher';

const messaging = { isEnabled: true, isOpen: false, setIsOpen: vi.fn() };
const client = Object.assign(new EventEmitter(), { getSyncState: () => 'SYNCING' });

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/matrix/activeClient', () => ({
  useMatrixClient: () => client,
  useMatrixSessionEstablishing: () => false,
}));
vi.mock('@/crd/components/chat/FloatingChatLauncher', () => ({ FloatingChatLauncher: () => null }));
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useScreenSize: () => ({ isSmallScreen: false }) }));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({ useUserMessagingContext: () => messaging }));
vi.mock('@/main/userMessaging/useUnreadConversationsCount', () => ({ useUnreadConversationsCount: () => 0 }));
vi.mock('./useChatDeepLink', () => ({ useChatDeepLinkOpen: vi.fn() }));
vi.mock('./UnifiedChatPanelConnector', () => ({
  UnifiedChatPanelConnector: ({ catchingUp }: { catchingUp?: boolean }) => (
    <output aria-label="panel">{String(catchingUp)}</output>
  ),
}));

const setVisibility = (state: DocumentVisibilityState) => {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('tells the panel the sync is catching up when the app resumed before the panel opened', () => {
  vi.useFakeTimers();
  const { rerender } = render(<UnifiedChatLauncher />);

  // The app comes back to the foreground (notification tap) while the panel is still closed.
  setVisibility('hidden');
  vi.advanceTimersByTime(60_000);
  setVisibility('visible');
  messaging.isOpen = true;
  rerender(<UnifiedChatLauncher />);
  expect(screen.getByLabelText('panel').textContent).toBe('true');

  // The next completed sync ends it.
  act(() => {
    client.emit('sync', 'SYNCING');
  });
  expect(screen.getByLabelText('panel').textContent).toBe('false');
});
