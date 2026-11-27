import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnifiedConversation } from './dataMapper';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

const pin = vi.hoisted(() => ({
  client: {} as object | null,
  togglePin: vi.fn(),
  notify: vi.fn(),
  conversations: [] as UnifiedConversation[],
}));
vi.mock('@/core/matrix/activeClient', async importOriginal => ({
  ...(await importOriginal<typeof import('@/core/matrix/activeClient')>()),
  useMatrixClient: () => pin.client,
}));
vi.mock('@/main/userMessaging/matrix/useMatrixPresence', () => ({
  useOwnStatusMessage: () => ({ statusMessage: '', setStatusMessage: vi.fn() }),
}));
vi.mock('@/main/userMessaging/matrix/useShowOnlinePreference', () => ({
  useShowOnlinePreference: () => ({ showOnline: true, setShowOnline: vi.fn() }),
}));
vi.mock('@/main/userMessaging/matrix/conversationSummaryStore', async importOriginal => ({
  ...(await importOriginal<typeof import('@/main/userMessaging/matrix/conversationSummaryStore')>()),
  storeFor: () => ({ togglePin: pin.togglePin }),
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
vi.mock('@/main/userMessaging/calls/useActiveCallRooms', () => ({ useLiveCalls: () => new Map() }));
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
    pin.togglePin.mockReset();
    pin.notify.mockReset();
    pin.conversations = [conversation('newer', 2), conversation('older', 1)];
  });

  it("toggles the pin of the conversation's room in the summary store", async () => {
    pin.togglePin.mockResolvedValue(undefined);
    render(<UnifiedChatPanelConnector />);

    await act(async () => listProps.onTogglePin('older'));

    expect(pin.togglePin).toHaveBeenCalledWith('room-older');
    expect(pin.notify).not.toHaveBeenCalled();
  });

  it('shows exactly one error toast when the toggle is rejected', async () => {
    pin.togglePin.mockRejectedValue(new Error('refused'));
    render(<UnifiedChatPanelConnector />);

    await act(async () => listProps.onTogglePin('older'));

    expect(pin.notify).toHaveBeenCalledTimes(1);
    expect(pin.notify).toHaveBeenCalledWith('list.pinError', 'error');
  });

  it('shows one error toast and writes nothing without a Matrix session', () => {
    pin.client = null;
    render(<UnifiedChatPanelConnector />);

    act(() => listProps.onTogglePin('older'));

    expect(pin.togglePin).not.toHaveBeenCalled();
    expect(pin.notify).toHaveBeenCalledTimes(1);
    expect(pin.notify).toHaveBeenCalledWith('list.pinError', 'error');
  });

  it('lists conversations in the order the hook gives, pins included', () => {
    pin.conversations = [conversation('older', 1, true), conversation('newer', 2)];
    render(<UnifiedChatPanelConnector />);

    expect(order()).toEqual(['older*', 'newer']);
  });
});
