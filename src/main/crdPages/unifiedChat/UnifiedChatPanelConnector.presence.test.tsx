import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GroupMember } from '@/crd/components/chat/types';
import type { ConversationMember, UserPresence } from '@/main/userMessaging/models';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

// The real list, thread, message mapping and bubbles run here: only the data sources are faked.
type Conversation = {
  id: string;
  roomId: string;
  isGroup: boolean;
  isGuidance: boolean;
  displayName: string;
  members: ConversationMember[];
};
type Parsed = { eventId: string; body: string; timestamp: number; sender: string; reactions: [] };

const state = vi.hoisted(() => ({
  selectedConversationId: null as string | null,
  conversations: [] as unknown[],
  timeline: [] as unknown[],
  live: new Map<string, { participants: string[] }>(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/crd/primitives/avatar');
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/main/userMessaging/useChatSound', () => ({ useChatSound: () => ({ enabled: true }) }));
vi.mock('@/main/userMessaging/matrix/useMatrixPresence', () => ({
  useOwnStatusMessage: () => ({ statusMessage: '', setStatusMessage: vi.fn() }),
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
    setSelectedConversationId: vi.fn(),
    setSelectedRoomId: vi.fn(),
    setNewlyCreatedConversationId: vi.fn(),
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({ useUnifiedChatContext: () => ({ guidanceVcId: undefined }) }));
vi.mock('./useChatDeepLink', () => ({ useChatDeepLinkSelect: vi.fn() }));
vi.mock('./useGroupSettings', () => ({
  useGroupSettings: () => ({ openDialog: vi.fn(), onOpenChange: vi.fn(), avatarUrl: '' }),
}));
vi.mock('./useGuidanceResponseState', () => ({ useGuidanceResponseState: () => ({ awaiting: false }) }));
vi.mock('./useNewChat', () => ({ useNewChat: () => ({}) }));
vi.mock('./useUnifiedConversations', () => ({
  useUnifiedConversations: () => ({ conversations: state.conversations, isLoading: false }),
}));
vi.mock('./useUnifiedConversationView', () => ({
  useUnifiedConversationView: () => ({ isSending: false, handleAddReaction: () => vi.fn() }),
}));
vi.mock('@/main/userMessaging/calls/useActiveCallRooms', () => ({ useLiveCalls: () => state.live }));
vi.mock('@/main/userMessaging/calls/useCallEligibility', () => ({
  useCallEligibility: () => ({ eligible: false, matrixRoomId: null }),
}));
vi.mock('@/main/userMessaging/calls/useRoomCallSession', () => ({ useRoomCallSession: () => ({}) }));
// The open room's Matrix timeline; the real useConversationMessages maps it with the conversation's members.
vi.mock('@/main/userMessaging/matrix/useConversationTimeline', () => ({
  useConversationTimeline: () => ({ messages: state.timeline, readUpToEventId: null, isLoading: false }),
}));
vi.mock('@/main/userMessaging/matrix/useActorProfiles', () => ({ useActorProfiles: () => new Map() }));
vi.mock('@/main/userMessaging/useAttachmentReadiness', () => ({
  useAttachmentReadiness: (messages: unknown) => messages,
}));
vi.mock('./attachments/useConversationStorageConfig', () => ({
  useConversationStorageConfig: () => ({ storageConfig: undefined }),
}));
vi.mock('./attachments/useConversationAttachments', () => ({
  useConversationAttachments: () => ({ isSending: false, enabled: false, attachments: [] }),
}));

vi.mock('@/crd/components/chat/ChatPanel', () => ({
  ChatPanel: (props: { titleAvatar?: ReactNode; subtitle?: ReactNode; children: ReactNode }) => (
    <>
      <div data-testid="title-avatar">{props.titleAvatar}</div>
      <div data-testid="subtitle">{props.subtitle}</div>
      {props.children}
    </>
  ),
}));
let groupMembers: GroupMember[] = [];
vi.mock('@/crd/components/chat/GroupSettingsDialog', () => ({
  GroupSettingsDialog: (props: { members: GroupMember[] }) => {
    groupMembers = props.members;
    return null;
  },
}));
vi.mock('@/crd/components/chat/ChatOptionsMenu', () => ({ ChatOptionsMenu: () => null }));
vi.mock('@/crd/components/chat/SetStatusDialog', () => ({ SetStatusDialog: () => null }));
vi.mock('@/crd/components/chat/NewChatDialog', () => ({ NewChatDialog: () => null }));
vi.mock('@/crd/components/chat/GuidanceInfoDialog', () => ({ GuidanceInfoDialog: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));

const member = (id: string, displayName: string, presence: UserPresence, statusMessage?: string) =>
  ({ id, type: 'USER', displayName, presence, statusMessage }) as ConversationMember;

const me = member('me', 'Me', 'online');
const directChat = (counterpart: ConversationMember): Conversation => ({
  id: 'direct',
  roomId: 'r-direct',
  isGroup: false,
  isGuidance: false,
  displayName: counterpart.displayName,
  members: [me, counterpart],
});
const groupChat: Conversation = {
  id: 'group',
  roomId: 'r-group',
  isGroup: true,
  isGuidance: false,
  displayName: 'Team',
  members: [me, member('ann', 'Ann', 'online', 'In a workshop'), member('bob', 'Bob', 'away')],
};
const said = (eventId: string, sender: string, body: string, timestamp: number): Parsed => ({
  eventId,
  body,
  timestamp,
  sender: `@${sender}:hs`,
  reactions: [],
});

const titleAvatar = () => screen.getByTestId('title-avatar');
const rowOf = (displayName: string) => screen.getByText(displayName).closest('button') as HTMLElement;

describe('UnifiedChatPanelConnector presence', () => {
  beforeEach(() => {
    state.selectedConversationId = null;
    state.conversations = [directChat(member('ann', 'Ann', 'online', 'In a workshop')), groupChat];
    state.timeline = [];
    state.live = new Map();
    groupMembers = [];
  });

  describe('1:1 thread header', () => {
    it("shows the counterpart's status message under their name, with the full text on hover", () => {
      state.selectedConversationId = 'direct';
      render(<UnifiedChatPanelConnector />);
      const status = within(screen.getByTestId('subtitle')).getByText('In a workshop');
      expect(status).toHaveAttribute('title', 'In a workshop');
      expect(status.tagName).toBe('SPAN');
    });

    it('shows no subtitle when the counterpart set no status message, never their availability label', () => {
      state.conversations = [directChat(member('ann', 'Ann', 'online'))];
      state.selectedConversationId = 'direct';
      render(<UnifiedChatPanelConnector />);
      expect(screen.getByTestId('subtitle')).toBeEmptyDOMElement();
      expect(within(titleAvatar()).getByRole('img', { name: 'presence.online' })).toBeInTheDocument();
    });
  });

  describe('group thread', () => {
    it("shows each sender's dot and status message from that member's presence", () => {
      state.selectedConversationId = 'group';
      state.timeline = [said('e1', 'ann', 'Hello', 1_000), said('e2', 'bob', 'Hi', 2_000)];
      render(<UnifiedChatPanelConnector />);
      expect(screen.getByRole('button', { name: 'Ann, In a workshop presence.online' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bob presence.away' })).toBeInTheDocument();
    });
  });

  describe('in a call', () => {
    it('shows a member in a live call as busy on their group sender avatar, keeping their status message', () => {
      state.selectedConversationId = 'group';
      state.timeline = [said('e1', 'ann', 'Hello', 1_000), said('e2', 'bob', 'Hi', 2_000)];
      state.live = new Map([['r-other', { participants: ['ann'] }]]);
      render(<UnifiedChatPanelConnector />);
      expect(screen.getByRole('button', { name: 'Ann, In a workshop presence.busy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bob presence.away' })).toBeInTheDocument();
    });

    it('shows them busy in the group settings members list, and leaves the others as they are', () => {
      state.selectedConversationId = 'group';
      state.live = new Map([['r-other', { participants: ['ann'] }]]);
      render(<UnifiedChatPanelConnector />);
      expect(groupMembers.map(({ id, presence, statusMessage }) => ({ id, presence, statusMessage }))).toEqual([
        { id: 'me', presence: 'online', statusMessage: undefined },
        { id: 'ann', presence: 'busy', statusMessage: 'In a workshop' },
        { id: 'bob', presence: 'away', statusMessage: undefined },
      ]);
    });

    it('shows a 1:1 counterpart in a call as busy on their list row and on the thread header avatar', () => {
      state.live = new Map([['r-group', { participants: ['ann'] }]]);
      const { unmount } = render(<UnifiedChatPanelConnector />);
      const directRow = rowOf('Ann');
      expect(within(directRow).getByRole('img', { name: 'presence.busy' })).toBeInTheDocument();
      unmount();

      state.selectedConversationId = 'direct';
      render(<UnifiedChatPanelConnector />);
      expect(within(titleAvatar()).getByRole('img', { name: 'presence.busy' })).toBeInTheDocument();
    });

    it('shows a group with a live call as busy on its list row and on its thread header avatar', () => {
      state.live = new Map([['r-group', { participants: ['ann'] }]]);
      const { unmount } = render(<UnifiedChatPanelConnector />);
      const groupRow = rowOf('Team');
      expect(within(groupRow).getByRole('img', { name: 'presence.busy' })).toBeInTheDocument();
      unmount();

      state.selectedConversationId = 'group';
      render(<UnifiedChatPanelConnector />);
      expect(within(titleAvatar()).getByRole('img', { name: 'presence.busy' })).toBeInTheDocument();
    });

    it('a group without a live call has no dot on its header avatar', () => {
      state.selectedConversationId = 'group';
      render(<UnifiedChatPanelConnector />);
      expect(within(titleAvatar()).queryByRole('img', { name: /^presence\./ })).not.toBeInTheDocument();
    });
  });
});
