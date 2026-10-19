import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
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
    selectedConversationId: 'c1',
    setSelectedConversationId: vi.fn(),
    setSelectedRoomId: vi.fn(),
    setNewlyCreatedConversationId: vi.fn(),
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({ useUnifiedChatContext: () => ({ guidanceVcId: undefined }) }));
vi.mock('./useChatDeepLink', () => ({ useChatDeepLinkSelect: vi.fn() }));
vi.mock('./useGroupSettings', () => ({ useGroupSettings: () => ({}) }));
vi.mock('./useGuidanceResponseState', () => ({ useGuidanceResponseState: () => ({ awaiting: false }) }));
vi.mock('./useNewChat', () => ({ useNewChat: () => ({}) }));
vi.mock('./useUnifiedConversations', () => ({
  useUnifiedConversations: () => ({
    conversations: [{ id: 'c1', members: [], isGuidance: false, isGroup: false }],
    isLoading: false,
  }),
}));
vi.mock('./dataMapper', () => ({
  injectGuidanceIntro: (m: unknown) => m,
  mapConversationToListItem: (c: { id: string }) => ({ id: c.id }),
  mapMembersToGroupMembers: () => [],
  mapMemberToCommentAuthor: () => ({}),
  mapMessageToChatMessage: (m: unknown) => m,
}));
vi.mock('@/main/userMessaging/useConversationMessages', () => ({
  useConversationMessages: () => ({
    messages: [{ id: 'm1', reactions: [{ id: 'r1', emoji: '👍', sender: { id: 'me' } }] }],
    isLoading: false,
  }),
}));

const addReaction = vi.fn();
const removeReaction = vi.fn();
vi.mock('./useUnifiedConversationView', () => ({
  useUnifiedConversationView: () => ({
    isSending: false,
    handleSendMessage: vi.fn(),
    handleAddReaction: () => addReaction,
    handleRemoveReaction: removeReaction,
    handleLeaveGroup: vi.fn(),
    clearGuidance: vi.fn(),
  }),
}));

type ThreadProps = {
  onAddReaction: (id: string, emoji: string) => void;
  onRemoveReaction: (id: string, e: string) => void;
};
let threadProps: ThreadProps;
vi.mock('./ConversationThread', () => ({
  ConversationThread: (props: ThreadProps) => {
    threadProps = props;
    return null;
  },
}));
vi.mock('@/crd/components/chat/ChatPanel', () => ({ ChatPanel: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/crd/components/chat/ChatConversationList', () => ({ ChatConversationList: () => null }));
vi.mock('@/crd/components/chat/ConversationAvatar', () => ({ ConversationAvatar: () => null }));
vi.mock('@/crd/components/chat/GroupSettingsDialog', () => ({ GroupSettingsDialog: () => null }));
vi.mock('@/crd/components/chat/GuidanceInfoDialog', () => ({ GuidanceInfoDialog: () => null }));
vi.mock('@/crd/components/chat/NewChatDialog', () => ({ NewChatDialog: () => null }));
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));

describe('UnifiedChatPanelConnector reaction failures', () => {
  beforeEach(() => {
    notifyMock.mockClear();
  });

  it('shows the generic error notification when adding a reaction is rejected', async () => {
    let reject: (reason: Error) => void = () => {};
    addReaction.mockReturnValue(new Promise<void>((_, rej) => (reject = rej)));
    render(<UnifiedChatPanelConnector />);

    threadProps.onAddReaction('m1', '👍');
    expect(notifyMock).not.toHaveBeenCalled();
    await act(async () => reject(new Error('refused')));

    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.generic', 'error');
  });

  it('shows the generic error notification when removing a reaction is rejected', async () => {
    let reject: (reason: Error) => void = () => {};
    removeReaction.mockReturnValue(new Promise<void>((_, rej) => (reject = rej)));
    render(<UnifiedChatPanelConnector />);

    threadProps.onRemoveReaction('m1', '👍');
    expect(notifyMock).not.toHaveBeenCalled();
    await act(async () => reject(new Error('refused')));

    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.generic', 'error');
  });
});
