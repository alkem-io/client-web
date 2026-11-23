import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnifiedConversation } from './dataMapper';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

const pin = vi.hoisted(() => ({
  client: {} as object | null,
  setFavourite: vi.fn(),
  notify: vi.fn(),
  conversations: [] as UnifiedConversation[],
}));
vi.mock('@/core/matrix/activeClient', async importOriginal => ({
  ...(await importOriginal<typeof import('@/core/matrix/activeClient')>()),
  useMatrixClient: () => pin.client,
}));
vi.mock('@/main/userMessaging/matrix/matrixRooms', async importOriginal => ({
  ...(await importOriginal<typeof import('@/main/userMessaging/matrix/matrixRooms')>()),
  setFavourite: pin.setFavourite,
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => pin.notify }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/main/userMessaging/useChatSound', () => ({
  useChatSound: () => ({ enabled: true, setEnabled: vi.fn() }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));
vi.mock('@/main/userMessaging/ConversationDraftsContext', () => ({
  useConversationDrafts: () => ({ drafts: {}, getDraft: () => '', setDraft: vi.fn(), clearDraft: vi.fn() }),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isOpen: true,
    setIsOpen: vi.fn(),
    selectedConversationId: null,
    setSelectedConversationId: vi.fn(),
    setSelectedRoomId: vi.fn(),
    newlyCreatedConversationId: null,
    setNewlyCreatedConversationId: vi.fn(),
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({ useUnifiedChatContext: () => ({ guidanceVcId: undefined }) }));
vi.mock('./useChatDeepLink', () => ({ useChatDeepLinkSelect: vi.fn() }));
vi.mock('./useGroupSettings', () => ({ useGroupSettings: () => ({}) }));
vi.mock('./useGuidanceResponseState', () => ({ useGuidanceResponseState: () => ({ awaiting: false }) }));
vi.mock('./useNewChat', () => ({ useNewChat: () => ({}) }));
vi.mock('./useUnifiedConversations', () => ({
  useUnifiedConversations: () => ({ conversations: pin.conversations, isLoading: false }),
}));
vi.mock('@/main/userMessaging/useConversationMessages', () => ({
  useConversationMessages: () => ({ messages: [], isLoading: false }),
}));
vi.mock('./useUnifiedConversationView', () => ({ useUnifiedConversationView: () => ({}) }));
vi.mock('@/main/userMessaging/calls/useCallEligibility', () => ({
  useCallEligibility: () => ({ eligible: false, matrixRoomId: null }),
}));
vi.mock('@/main/userMessaging/calls/useRoomCallSession', () => ({ useRoomCallSession: () => ({}) }));
vi.mock('@/main/userMessaging/calls/useActiveCallRooms', () => ({ useActiveCallRooms: () => new Set() }));
vi.mock('./ConversationThread', () => ({ ConversationThread: () => null }));

type ListProps = { conversations: { id: string; userPinned?: boolean }[]; onTogglePin: (id: string) => void };
let listProps: ListProps;
vi.mock('@/crd/components/chat/ChatConversationList', () => ({
  ChatConversationList: (props: ListProps) => {
    listProps = props;
    return null;
  },
}));
vi.mock('@/crd/components/chat/ChatPanel', () => ({ ChatPanel: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/crd/components/chat/ConversationAvatar', () => ({ ConversationAvatar: () => null }));
vi.mock('@/crd/components/chat/GroupSettingsDialog', () => ({ GroupSettingsDialog: () => null }));
vi.mock('@/crd/components/chat/GuidanceInfoDialog', () => ({ GuidanceInfoDialog: () => null }));
vi.mock('@/crd/components/chat/NewChatDialog', () => ({ NewChatDialog: () => null }));
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));

const conversation = (id: string, createdMs: number, userPinned = false): UnifiedConversation => ({
  id,
  roomId: `room-${id}`,
  isGroup: false,
  unreadCount: 0,
  createdDate: new Date(createdMs),
  members: [],
  isGuidance: false,
  pinned: false,
  userPinned,
});

const order = () => listProps.conversations.map(item => `${item.id}${item.userPinned ? '*' : ''}`);

describe('UnifiedChatPanelConnector pinning', () => {
  beforeEach(() => {
    pin.client = {};
    pin.setFavourite.mockReset();
    pin.notify.mockReset();
    pin.conversations = [conversation('newer', 2), conversation('older', 1)];
  });

  it('moves a pinned conversation to the top before the Matrix write settles', () => {
    pin.setFavourite.mockReturnValue(new Promise(() => {}));
    render(<UnifiedChatPanelConnector />);
    expect(order()).toEqual(['newer', 'older']);

    act(() => listProps.onTogglePin('older'));

    expect(order()).toEqual(['older*', 'newer']);
    expect(pin.setFavourite).toHaveBeenCalledWith(pin.client, 'room-older', true);
  });

  it('rolls the pin back and shows exactly one error toast when the Matrix write fails', async () => {
    let reject: (reason: Error) => void = () => {};
    pin.setFavourite.mockReturnValue(new Promise<void>((_, rej) => (reject = rej)));
    render(<UnifiedChatPanelConnector />);

    act(() => listProps.onTogglePin('older'));
    await act(async () => reject(new Error('refused')));

    expect(order()).toEqual(['newer', 'older']);
    expect(pin.notify).toHaveBeenCalledTimes(1);
    expect(pin.notify).toHaveBeenCalledWith('list.pinError', 'error');
  });

  it('shows one error toast and changes nothing without a Matrix session', () => {
    pin.client = null;
    render(<UnifiedChatPanelConnector />);

    act(() => listProps.onTogglePin('older'));

    expect(order()).toEqual(['newer', 'older']);
    expect(pin.setFavourite).not.toHaveBeenCalled();
    expect(pin.notify).toHaveBeenCalledTimes(1);
    expect(pin.notify).toHaveBeenCalledWith('list.pinError', 'error');
  });

  it('unpins a conversation pinned by the sync', () => {
    pin.setFavourite.mockReturnValue(new Promise(() => {}));
    pin.conversations = [conversation('pinned', 1, true), conversation('other', 2)];
    render(<UnifiedChatPanelConnector />);

    act(() => listProps.onTogglePin('pinned'));

    expect(order()).toEqual(['other', 'pinned']);
    expect(pin.setFavourite).toHaveBeenCalledWith(pin.client, 'room-pinned', false);
  });

  it('follows the sync again once it has echoed the pin, so another device can unpin it', async () => {
    pin.setFavourite.mockResolvedValue(undefined);
    const { rerender } = render(<UnifiedChatPanelConnector />);
    await act(async () => listProps.onTogglePin('older'));

    pin.conversations = [conversation('newer', 2), conversation('older', 1, true)];
    rerender(<UnifiedChatPanelConnector />);
    expect(order()).toEqual(['older*', 'newer']);

    pin.conversations = [conversation('newer', 2), conversation('older', 1)];
    rerender(<UnifiedChatPanelConnector />);
    expect(order()).toEqual(['newer', 'older']);
  });
});
