import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

type Member = { id: string; displayName: string; avatarUri?: string };
type Conversation = { id: string; roomId: string; members: Member[]; isGuidance: boolean; isGroup: boolean };

const state: { selectedConversationId: string | null; conversations: Conversation[] } = {
  selectedConversationId: null,
  conversations: [],
};
const openGroupSettings = vi.fn();
const calls = vi.hoisted(() => ({
  eligibility: { eligible: false, matrixRoomId: null as string | null },
  session: { participants: [] as string[], participantCount: 0, isJoinedOnThisDevice: false, isJoinedHere: false },
  activeRooms: new Set<string>(),
  openCall: vi.fn(),
  eligibilityInput: [] as unknown[],
}));
vi.mock('@/main/userMessaging/calls/useCallEligibility', () => ({
  useCallEligibility: (conversation: unknown) => {
    calls.eligibilityInput.push(conversation);
    return calls.eligibility;
  },
}));
vi.mock('@/main/userMessaging/calls/useRoomCallSession', () => ({ useRoomCallSession: () => calls.session }));
vi.mock('@/main/userMessaging/calls/useActiveCallRooms', () => ({ useActiveCallRooms: () => calls.activeRooms }));
vi.mock('@/main/userMessaging/calls/callOverlayStore', () => ({ openCall: calls.openCall }));
const leaveGroup = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
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
    selectedConversationId: state.selectedConversationId,
    setSelectedConversationId: vi.fn(),
    setSelectedRoomId: vi.fn(),
    setNewlyCreatedConversationId: vi.fn(),
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({ useUnifiedChatContext: () => ({ guidanceVcId: undefined }) }));
vi.mock('./useChatDeepLink', () => ({ useChatDeepLinkSelect: vi.fn() }));
vi.mock('./useGroupSettings', () => ({
  useGroupSettings: () => ({ openDialog: openGroupSettings, onOpenChange: vi.fn(), avatarUrl: '' }),
}));
vi.mock('./useGuidanceResponseState', () => ({ useGuidanceResponseState: () => ({ awaiting: false }) }));
vi.mock('./useNewChat', () => ({ useNewChat: () => ({}) }));
vi.mock('./dataMapper', async importOriginal => ({
  ...(await importOriginal<typeof import('./dataMapper')>()),
  mapConversationToListItem: (conversation: { id: string }) => ({ id: conversation.id }),
}));
vi.mock('./useUnifiedConversations', () => ({
  useUnifiedConversations: () => ({ conversations: state.conversations, isLoading: false }),
}));
vi.mock('@/main/userMessaging/useConversationMessages', () => ({
  useConversationMessages: () => ({ messages: [], isLoading: false }),
}));
vi.mock('./useUnifiedConversationView', () => ({
  useUnifiedConversationView: () => ({
    isSending: false,
    handleSendMessage: vi.fn(),
    handleAddReaction: () => vi.fn(),
    handleRemoveReaction: vi.fn(),
    handleLeaveGroup: leaveGroup,
    clearGuidance: vi.fn(),
  }),
}));
vi.mock('./ConversationThread', () => ({ ConversationThread: () => null }));
type ListProps = { conversations: { id: string; hasActiveCall?: boolean }[] };
let listProps: ListProps | undefined;
vi.mock('@/crd/components/chat/ChatConversationList', () => ({
  ChatConversationList: (props: ListProps) => {
    listProps = props;
    return null;
  },
}));
vi.mock('@/crd/components/chat/ConversationAvatar', () => ({ ConversationAvatar: () => null }));
vi.mock('@/crd/components/chat/GuidanceInfoDialog', () => ({ GuidanceInfoDialog: () => null }));
vi.mock('@/crd/components/chat/NewChatDialog', () => ({ NewChatDialog: () => null }));
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));

type PanelProps = {
  onGoToSettings?: () => void;
  onTitleClick?: () => void;
  titleActionLabel?: string;
  expandLabel: string;
  collapseLabel: string;
  headerActions?: ReactNode;
  children: ReactNode;
};
vi.mock('@/crd/components/chat/ChatPanel', () => ({
  ChatPanel: (props: PanelProps) => {
    return (
      <>
        {props.headerActions}
        {props.children}
      </>
    );
  },
}));

type MenuProps = { label: string; onOpenSettings: () => void; onLeave: () => void };
let menuProps: MenuProps | undefined;
vi.mock('@/crd/components/chat/ChatOptionsMenu', () => ({
  ChatOptionsMenu: (props: MenuProps) => {
    menuProps = props;
    return null;
  },
}));

type ConfirmProps = { open: boolean; title: string; onConfirm: () => void };
const confirmations: ConfirmProps[] = [];
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({
  ConfirmationDialog: (props: ConfirmProps) => {
    confirmations.push(props);
    return null;
  },
}));

type SettingsDialogProps = { avatarSlot: ReactNode };
vi.mock('@/crd/components/chat/GroupSettingsDialog', () => ({
  GroupSettingsDialog: (props: SettingsDialogProps) => <>{props.avatarSlot}</>,
}));

vi.mock('@/crd/components/chat/GroupAvatar', () => ({ GroupAvatar: () => null }));

const directChat: Conversation = {
  id: 'direct',
  roomId: 'r-direct',
  isGroup: false,
  isGuidance: false,
  members: [
    { id: 'me', displayName: 'Me' },
    { id: 'u1', displayName: 'Ann' },
  ],
};
const groupChat: Conversation = {
  id: 'group',
  roomId: 'r-group',
  isGroup: true,
  isGuidance: false,
  members: [
    { id: 'me', displayName: 'Me' },
    { id: 'u1', displayName: 'Ann' },
    { id: 'u2', displayName: 'Bob' },
  ],
};

const eligible = () => {
  calls.eligibility = { eligible: true, matrixRoomId: '!group:hs' };
};

describe('UnifiedChatPanelConnector group calls', () => {
  beforeEach(() => {
    calls.eligibility = { eligible: false, matrixRoomId: null };
    calls.session = { participants: [], participantCount: 0, isJoinedOnThisDevice: false, isJoinedHere: false };
    calls.activeRooms = new Set();
    calls.openCall.mockClear();
    calls.eligibilityInput.length = 0;
    state.conversations = [directChat, groupChat];
    state.selectedConversationId = 'group';
    listProps = undefined;
  });

  it('offers start-call controls before the options menu in an eligible group with no call', async () => {
    eligible();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(calls.eligibilityInput[calls.eligibilityInput.length - 1]).toBe(groupChat);
    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      alkemioRoomId: 'r-group',
      matrixRoomId: '!group:hs',
      intent: 'start_call',
    });
    await user.click(screen.getByRole('button', { name: 'call.startAudio' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      alkemioRoomId: 'r-group',
      matrixRoomId: '!group:hs',
      intent: 'start_call_voice',
    });
    expect(menuProps).toBeDefined();
  });

  it('shows nothing call-related when the conversation is not eligible', () => {
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByTestId('call-controls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('call-active-indicator')).not.toBeInTheDocument();
    expect(menuProps).toBeDefined();
  });

  it('shows the active call with its participant count and join buttons instead of the start controls', async () => {
    eligible();
    calls.session = {
      participants: ['@ann:hs', '@bob:hs'],
      participantCount: 2,
      isJoinedOnThisDevice: false,
      isJoinedHere: false,
    };
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(screen.queryByTestId('call-controls')).not.toBeInTheDocument();
    expect(screen.getByText('call.active')).toBeInTheDocument();
    expect(screen.getByTestId('call-participant-count')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'call.joinVideo' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      alkemioRoomId: 'r-group',
      matrixRoomId: '!group:hs',
      intent: 'join_existing',
    });
    await user.click(screen.getByRole('button', { name: 'call.joinAudio' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      alkemioRoomId: 'r-group',
      matrixRoomId: '!group:hs',
      intent: 'join_existing_voice',
    });
  });

  it('offers no join while this tab is already in the call', () => {
    eligible();
    calls.session = { participants: ['@me:hs'], participantCount: 1, isJoinedOnThisDevice: true, isJoinedHere: true };
    render(<UnifiedChatPanelConnector />);
    expect(screen.getByTestId('call-active-indicator')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'call.joinVideo' })).not.toBeInTheDocument();
    expect(screen.queryByText('call.joinedOnThisDevice')).not.toBeInTheDocument();
  });

  it('says the call is joined on this device in another tab, instead of offering to join it twice', () => {
    eligible();
    calls.session = { participants: ['@me:hs'], participantCount: 1, isJoinedOnThisDevice: true, isJoinedHere: false };
    render(<UnifiedChatPanelConnector />);
    expect(screen.getByText('call.joinedOnThisDevice')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'call.joinVideo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'call.joinAudio' })).not.toBeInTheDocument();
  });

  it('hides a running call from someone who is not eligible', () => {
    calls.session = {
      participants: ['@ann:hs'],
      participantCount: 1,
      isJoinedOnThisDevice: false,
      isJoinedHere: false,
    };
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByTestId('call-active-indicator')).not.toBeInTheDocument();
  });

  it('marks list rows of conversations with a running call', () => {
    state.selectedConversationId = null;
    calls.activeRooms = new Set(['r-group']);
    render(<UnifiedChatPanelConnector />);
    expect(listProps?.conversations).toEqual([{ id: 'direct' }, { id: 'group', hasActiveCall: true }]);
  });
});
