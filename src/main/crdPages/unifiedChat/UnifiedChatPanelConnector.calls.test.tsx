import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

type Member = { id: string; displayName: string; avatarUri?: string; presence?: string };
type Conversation = {
  id: string;
  roomId: string;
  members: Member[];
  isGuidance: boolean;
  isGroup: boolean;
  ringingEventId?: string;
};

const state: { selectedConversationId: string | null; conversations: Conversation[] } = {
  selectedConversationId: null,
  conversations: [],
};
const openGroupSettings = vi.fn();
const setSelectedConversationId = vi.fn();
const calls = vi.hoisted(() => ({
  eligibility: { eligible: false, matrixRoomId: null as string | null },
  session: { participants: [] as string[], participantCount: 0, isJoinedOnThisDevice: false, isJoinedHere: false },
  live: new Map<
    string,
    { participants: string[]; startedTs?: number; latestTs?: number; matrixRoomId?: string; withMyDevice?: boolean }
  >(),
  dismissCall: vi.fn(),
  sendRtcDecline: vi.fn(),
  client: null as unknown,
  notify: vi.fn(),
  openCall: vi.fn(),
  rotate: vi.fn(),
  eligibilityInput: [] as unknown[],
}));
vi.mock('@/core/matrix/activeSession', async importOriginal => ({
  ...(await importOriginal<typeof import('@/core/matrix/activeSession')>()),
  rotateActiveSessionIfDue: calls.rotate,
}));
vi.mock('@/main/userMessaging/calls/useCallEligibility', () => ({
  useCallEligibility: (conversation: unknown) => {
    calls.eligibilityInput.push(conversation);
    return calls.eligibility;
  },
}));
vi.mock('@/main/userMessaging/calls/useRoomCallSession', () => ({ useRoomCallSession: () => calls.session }));
vi.mock('@/main/userMessaging/calls/useActiveCallRooms', () => ({ useLiveCalls: () => calls.live }));
vi.mock('@/main/userMessaging/calls/callOverlayStore', () => ({ openCall: calls.openCall }));
vi.mock('@/main/userMessaging/calls/callDismissalStore', () => ({ dismissCall: calls.dismissCall }));
const leaveGroup = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => calls.notify }));
vi.mock('@/core/matrix/activeClient', async importOriginal => ({
  ...(await importOriginal<typeof import('@/core/matrix/activeClient')>()),
  useMatrixClient: () => calls.client,
}));
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
    selectedConversationId: state.selectedConversationId,
    setSelectedConversationId,
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
vi.mock('./ConversationThread', () => ({
  ConversationThread: ({ onCallBack }: { onCallBack?: () => void }) =>
    onCallBack ? (
      <button type="button" onClick={onCallBack}>
        call.row.callBack
      </button>
    ) : null,
}));
type ListProps = { conversations: { id: string; hasActiveCall?: boolean; onJoinCall?: () => void }[] };
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
  onTitleClick?: () => void;
  titleActionLabel?: string;
  expandLabel: string;
  collapseLabel: string;
  headerActions?: ReactNode;
  banner?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
};
vi.mock('@/crd/components/chat/ChatPanel', () => ({
  ChatPanel: (props: PanelProps) => {
    return (
      <>
        {props.headerActions}
        {props.banner}
        {props.notice}
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
    { id: 'u2', displayName: 'Bob', presence: 'online' },
  ],
};

const eligible = () => {
  calls.eligibility = { eligible: true, matrixRoomId: '!group:hs' };
};

describe('UnifiedChatPanelConnector calls', () => {
  beforeEach(() => {
    calls.eligibility = { eligible: false, matrixRoomId: null };
    calls.session = { participants: [], participantCount: 0, isJoinedOnThisDevice: false, isJoinedHere: false };
    calls.live = new Map();
    calls.dismissCall.mockClear();
    calls.sendRtcDecline.mockReset();
    calls.client = null;
    calls.notify.mockClear();
    calls.openCall.mockClear();
    calls.rotate.mockReset();
    calls.rotate.mockResolvedValue(false);
    calls.eligibilityInput.length = 0;
    setSelectedConversationId.mockClear();
    state.conversations = [directChat, groupChat];
    state.selectedConversationId = 'group';
    listProps = undefined;
    menuProps = undefined;
  });

  it('offers start-call controls before the options menu in an eligible group with no call', async () => {
    eligible();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(calls.eligibilityInput[calls.eligibilityInput.length - 1]).toEqual(groupChat);
    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      matrixRoomId: '!group:hs',
      intent: 'start_call',
    });
    await user.click(screen.getByRole('button', { name: 'call.startAudio' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      matrixRoomId: '!group:hs',
      intent: 'start_call_voice',
    });
    expect(menuProps).toBeDefined();
  });

  it('calls back from a missed call while no call runs, and offers no call back while one does', async () => {
    eligible();
    state.selectedConversationId = 'direct';
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const { rerender } = render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.row.callBack' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!group:hs', intent: 'start_call_dm' });

    calls.session = { participants: ['@u1:hs'], participantCount: 1, isJoinedOnThisDevice: false, isJoinedHere: false };
    rerender(<UnifiedChatPanelConnector />);
    expect(screen.queryByRole('button', { name: 'call.row.callBack' })).not.toBeInTheDocument();
  });

  it('opens the call when the chat session has nothing to rotate', async () => {
    eligible();
    let settle: (rotated: boolean) => void = () => {};
    calls.rotate.mockReturnValue(
      new Promise<boolean>(resolve => {
        settle = resolve;
      })
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    expect(calls.openCall).not.toHaveBeenCalled();
    expect(calls.rotate).toHaveBeenCalledOnce();
    await act(async () => settle(false));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!group:hs', intent: 'start_call' });
    expect(screen.queryByText('call.preparing')).not.toBeInTheDocument();
  });

  const rotationPending = () => {
    let settle: (rotated: boolean) => void = () => {};
    calls.rotate.mockReturnValue(
      new Promise<boolean>(resolve => {
        settle = resolve;
      })
    );
    return (rotated: boolean) => settle(rotated);
  };

  it('queues the call through a rotation and opens it once the new session has the same room', async () => {
    eligible();
    const settle = rotationPending();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const { rerender } = render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    expect(screen.getByText('call.preparing')).toBeInTheDocument();
    // The swap: the old client is gone and the new one has not synced yet.
    calls.eligibility = { eligible: false, matrixRoomId: null };
    await act(async () => settle(true));
    rerender(<UnifiedChatPanelConnector />);
    expect(calls.openCall).not.toHaveBeenCalled();
    expect(screen.getByText('call.preparing')).toBeInTheDocument();

    eligible();
    rerender(<UnifiedChatPanelConnector />);
    expect(calls.openCall).toHaveBeenCalledExactlyOnceWith({ matrixRoomId: '!group:hs', intent: 'start_call' });
    expect(screen.queryByText('call.preparing')).not.toBeInTheDocument();
  });

  it('drops a queued call that has not opened 10 s after the click', async () => {
    eligible();
    const settle = rotationPending();
    vi.useFakeTimers();
    try {
      const { rerender } = render(<UnifiedChatPanelConnector />);
      fireEvent.click(screen.getByRole('button', { name: 'call.startVideo' }));
      act(() => vi.advanceTimersByTime(9_999));
      expect(screen.getByText('call.preparing')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.queryByText('call.preparing')).not.toBeInTheDocument();
      expect(screen.getByText('call.dropped')).toBeInTheDocument();

      // The rotation finishing late opens nothing.
      await act(async () => settle(true));
      rerender(<UnifiedChatPanelConnector />);
      expect(calls.openCall).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(8_000));
      expect(screen.queryByText('call.dropped')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears the try-again notice when the user clicks call again', async () => {
    eligible();
    rotationPending();
    vi.useFakeTimers();
    try {
      render(<UnifiedChatPanelConnector />);
      fireEvent.click(screen.getByRole('button', { name: 'call.startVideo' }));
      act(() => vi.advanceTimersByTime(10_000));
      expect(screen.getByText('call.dropped')).toBeInTheDocument();

      calls.rotate.mockResolvedValue(false);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'call.startVideo' }));
      });
      expect(screen.queryByText('call.dropped')).not.toBeInTheDocument();
      expect(calls.openCall).toHaveBeenCalledExactlyOnceWith({ matrixRoomId: '!group:hs', intent: 'start_call' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens a queued call on the old session when the rotation could not swap it', async () => {
    eligible();
    calls.rotate.mockResolvedValue(true);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.startAudio' }));
    await act(async () => {});
    expect(calls.openCall).toHaveBeenCalledExactlyOnceWith({ matrixRoomId: '!group:hs', intent: 'start_call_voice' });
  });

  it('ignores another call click while a call is queued', async () => {
    eligible();
    rotationPending();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    await user.click(screen.getByRole('button', { name: 'call.startAudio' }));
    expect(calls.rotate).toHaveBeenCalledOnce();
  });

  it('drops a queued call when another conversation is opened', async () => {
    eligible();
    const settle = rotationPending();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const { rerender } = render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    state.selectedConversationId = 'direct';
    rerender(<UnifiedChatPanelConnector />);
    await act(async () => settle(true));
    state.selectedConversationId = 'group';
    rerender(<UnifiedChatPanelConnector />);
    expect(calls.openCall).not.toHaveBeenCalled();
    expect(screen.queryByText('call.preparing')).not.toBeInTheDocument();
  });

  it('shows nothing call-related when the conversation is not eligible', () => {
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByTestId('call-controls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('call-banner')).not.toBeInTheDocument();
    expect(menuProps).toBeDefined();
  });

  it('shows a running call as a banner with who is in it and joins it, instead of the start controls', async () => {
    eligible();
    calls.session = {
      participants: ['@u1:hs', '@u2:hs'],
      participantCount: 2,
      isJoinedOnThisDevice: false,
      isJoinedHere: false,
    };
    calls.live = new Map([['r-group', { participants: ['u1', 'u2'], startedTs: Date.now() }]]);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(screen.queryByTestId('call-controls')).not.toBeInTheDocument();
    expect(screen.getByTestId('call-banner')).toHaveTextContent('call.banner.inProgress');
    expect(screen.getByTestId('call-banner')).toHaveTextContent('call.banner.participantsTwo · 00:00');

    await user.click(screen.getByRole('button', { name: 'call.joinVideo' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      matrixRoomId: '!group:hs',
      intent: 'join_existing',
    });
    await user.click(screen.getByRole('button', { name: 'call.joinAudio' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({
      matrixRoomId: '!group:hs',
      intent: 'join_existing_voice',
    });
  });

  it('shows no banner while this tab is in the call', () => {
    eligible();
    calls.session = { participants: ['@me:hs'], participantCount: 1, isJoinedOnThisDevice: true, isJoinedHere: true };
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByTestId('call-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('call-controls')).not.toBeInTheDocument();
  });

  it('says the call is joined on this device in another tab, instead of offering to join it twice', () => {
    eligible();
    calls.session = { participants: ['@me:hs'], participantCount: 1, isJoinedOnThisDevice: true, isJoinedHere: false };
    render(<UnifiedChatPanelConnector />);
    expect(screen.getByTestId('call-banner')).toHaveTextContent('call.joinedOnThisDevice');
    expect(screen.queryByRole('button', { name: 'call.joinVideo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'call.joinAudio' })).not.toBeInTheDocument();
  });

  it('hides a running call from someone who is not eligible', () => {
    calls.session = {
      participants: ['@u1:hs'],
      participantCount: 1,
      isJoinedOnThisDevice: false,
      isJoinedHere: false,
    };
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByTestId('call-banner')).not.toBeInTheDocument();
  });

  it('offers start-call controls in an eligible 1:1 conversation, opening direct calls', async () => {
    state.selectedConversationId = 'direct';
    calls.eligibility = { eligible: true, matrixRoomId: '!direct:hs' };
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(calls.eligibilityInput[calls.eligibilityInput.length - 1]).toEqual(directChat);
    await user.click(screen.getByRole('button', { name: 'call.startVideo' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!direct:hs', intent: 'start_call_dm' });
    await user.click(screen.getByRole('button', { name: 'call.startAudio' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!direct:hs', intent: 'start_call_dm_voice' });
    // A 1:1 conversation has no group options menu.
    expect(menuProps).toBeUndefined();
  });

  const directCallRunning = () => {
    state.selectedConversationId = 'direct';
    calls.eligibility = { eligible: true, matrixRoomId: '!direct:hs' };
    calls.session = {
      participants: ['@u1:hs'],
      participantCount: 1,
      isJoinedOnThisDevice: false,
      isJoinedHere: false,
    };
    calls.live = new Map([['r-direct', { participants: ['u1'], startedTs: 5, latestTs: 7 }]]);
  };

  it('shows a running 1:1 call whose ring is not ringing as a banner and joins it as a direct call', async () => {
    directCallRunning();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(screen.queryByTestId('call-banner-ringing')).not.toBeInTheDocument();
    expect(screen.getByTestId('call-banner')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'call.joinVideo' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!direct:hs', intent: 'join_existing_dm' });
    await user.click(screen.getByRole('button', { name: 'call.joinAudio' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!direct:hs', intent: 'join_existing_dm_voice' });
  });

  const ringing = () => {
    directCallRunning();
    state.conversations = [{ ...directChat, ringingEventId: '$ring' }, groupChat];
    calls.client = {
      getUserId: () => null,
      on: vi.fn(),
      removeListener: vi.fn(),
      sendRtcDecline: calls.sendRtcDecline,
    };
  };

  it('rings while the other person’s ring rings; Answer joins it', async () => {
    ringing();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    expect(screen.queryByTestId('call-banner')).not.toBeInTheDocument();
    expect(screen.getByTestId('call-banner-ringing')).toHaveTextContent('call.banner.calling');
    await user.click(screen.getByRole('button', { name: 'call.banner.answer' }));
    expect(calls.openCall).toHaveBeenLastCalledWith({ matrixRoomId: '!direct:hs', intent: 'join_existing_dm' });
    expect(calls.dismissCall).not.toHaveBeenCalled();
  });

  it('declines a ringing call by sending the decline of its ring, then dismissing it in every tab, without joining', async () => {
    ringing();
    calls.sendRtcDecline.mockResolvedValue({ event_id: '$decline' });
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.banner.decline' }));
    expect(calls.sendRtcDecline).toHaveBeenCalledExactlyOnceWith('!direct:hs', '$ring');
    await vi.waitFor(() => expect(calls.dismissCall).toHaveBeenCalledExactlyOnceWith('r-direct', 7));
    expect(calls.openCall).not.toHaveBeenCalled();
    expect(calls.rotate).not.toHaveBeenCalled();
  });

  it('keeps ringing and shows the error once when the decline cannot be sent', async () => {
    ringing();
    calls.sendRtcDecline.mockRejectedValue(new Error('M_FORBIDDEN'));
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<UnifiedChatPanelConnector />);

    await user.click(screen.getByRole('button', { name: 'call.banner.decline' }));
    await vi.waitFor(() => expect(calls.notify).toHaveBeenCalledExactlyOnceWith('apollo.errors.generic', 'error'));
    expect(calls.dismissCall).not.toHaveBeenCalled();
    expect(screen.getByTestId('call-banner-ringing')).toBeInTheDocument();
  });

  it('shows nothing call-related in a 1:1 conversation that is not eligible', () => {
    state.selectedConversationId = 'direct';
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByTestId('call-controls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('call-banner')).not.toBeInTheDocument();
  });

  it('marks list rows of conversations with a running call, busy, and moves them to the top', () => {
    state.selectedConversationId = null;
    calls.live = new Map([['r-group', { participants: ['u2'] }]]);
    render(<UnifiedChatPanelConnector />);
    expect(listProps?.conversations).toEqual([
      { id: 'group', hasActiveCall: true, presence: 'busy', onJoinCall: expect.any(Function) },
      { id: 'direct' },
    ]);
  });

  it('joins a running call from its list row, opening the conversation', async () => {
    state.selectedConversationId = null;
    calls.live = new Map([['r-group', { participants: ['u2'], matrixRoomId: '!group:hs' }]]);
    render(<UnifiedChatPanelConnector />);

    await act(async () => listProps?.conversations[0].onJoinCall?.());
    expect(setSelectedConversationId).toHaveBeenCalledWith('group');
    expect(calls.openCall).toHaveBeenCalledExactlyOnceWith({ matrixRoomId: '!group:hs', intent: 'join_existing' });
  });

  it('joins a 1:1 call from its list row as a direct call', async () => {
    state.selectedConversationId = null;
    calls.live = new Map([['r-direct', { participants: ['u1'], matrixRoomId: '!direct:hs' }]]);
    render(<UnifiedChatPanelConnector />);

    await act(async () => listProps?.conversations[0].onJoinCall?.());
    expect(calls.openCall).toHaveBeenCalledExactlyOnceWith({ matrixRoomId: '!direct:hs', intent: 'join_existing_dm' });
  });

  it('offers no Join on a row whose call this device is already in, as the banner does', () => {
    state.selectedConversationId = null;
    calls.live = new Map([['r-group', { participants: ['me', 'u2'], matrixRoomId: '!group:hs', withMyDevice: true }]]);
    render(<UnifiedChatPanelConnector />);
    expect(listProps?.conversations[0]).toMatchObject({ id: 'group', hasActiveCall: true });
    expect(listProps?.conversations[0].onJoinCall).toBeUndefined();
  });

  it('offers Join on a row whose call the user is in on another device only, as the banner does', () => {
    state.selectedConversationId = null;
    calls.live = new Map([['r-group', { participants: ['me', 'u2'], matrixRoomId: '!group:hs', withMyDevice: false }]]);
    render(<UnifiedChatPanelConnector />);
    expect(listProps?.conversations[0].onJoinCall).toBeTypeOf('function');
  });
});
