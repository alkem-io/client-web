import { EventEmitter } from 'node:events';
import { act, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { UnifiedChatLauncher } from './UnifiedChatLauncher';

const messaging = { isEnabled: true, isOpen: false, setIsOpen: vi.fn() };
const client = Object.assign(new EventEmitter(), { getSyncState: () => 'SYNCING' });

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => client }));
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

it('tells the panel the sync is catching up when the app resumed before the panel opened', () => {
  const { rerender } = render(<UnifiedChatLauncher />);

  // The app comes to the foreground (notification tap) while the panel is still closed.
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  messaging.isOpen = true;
  rerender(<UnifiedChatLauncher />);
  expect(screen.getByLabelText('panel').textContent).toBe('true');

  // The next completed sync ends it.
  act(() => {
    client.emit('sync', 'SYNCING');
  });
  expect(screen.getByLabelText('panel').textContent).toBe('false');
});
