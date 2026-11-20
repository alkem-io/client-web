import { render } from '@testing-library/react';
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
const leaveGroup = vi.fn();

const notify = vi.fn();
const chatSound: { enabled: boolean; setEnabled: ReturnType<typeof vi.fn> | undefined } = {
  enabled: true,
  setEnabled: vi.fn(),
};
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/main/userMessaging/useChatSound', () => ({ useChatSound: () => chatSound }));
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
vi.mock('@/crd/components/chat/ChatConversationList', () => ({ ChatConversationList: () => null }));
vi.mock('@/crd/components/chat/ConversationAvatar', () => ({ ConversationAvatar: () => null }));
vi.mock('@/crd/components/chat/GuidanceInfoDialog', () => ({ GuidanceInfoDialog: () => null }));
vi.mock('@/crd/components/chat/NewChatDialog', () => ({ NewChatDialog: () => null }));
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));

type PanelProps = {
  onGoToSettings?: () => void;
  onToggleSound?: () => void;
  soundMuted?: boolean;
  muteSoundLabel: string;
  unmuteSoundLabel: string;
  onTitleClick?: () => void;
  titleActionLabel?: string;
  expandLabel: string;
  collapseLabel: string;
  headerActions?: ReactNode;
  children: ReactNode;
};
let panelProps: PanelProps;
vi.mock('@/crd/components/chat/ChatPanel', () => ({
  ChatPanel: (props: PanelProps) => {
    panelProps = props;
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

let groupAvatarMembers: { id: string }[] | undefined;
vi.mock('@/crd/components/chat/GroupAvatar', () => ({
  GroupAvatar: ({ members }: { members: { id: string }[] }) => {
    groupAvatarMembers = members;
    return null;
  },
}));

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

const lastLeaveConfirmation = () =>
  [...confirmations].reverse().find(props => props.title === 'group.leaveConfirm.title');

describe('UnifiedChatPanelConnector header', () => {
  beforeEach(() => {
    state.conversations = [directChat, groupChat];
    state.selectedConversationId = null;
    menuProps = undefined;
    groupAvatarMembers = undefined;
    confirmations.length = 0;
    openGroupSettings.mockClear();
    leaveGroup.mockClear();
    notify.mockClear();
    chatSound.enabled = true;
    chatSound.setEnabled = vi.fn().mockResolvedValue(undefined);
  });

  it('offers the sound toggle in the conversation list, muting when the sound is on', () => {
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.soundMuted).toBe(false);
    expect(panelProps.muteSoundLabel).toBe('panel.muteSound');
    expect(panelProps.unmuteSoundLabel).toBe('panel.unmuteSound');

    panelProps.onToggleSound?.();

    expect(chatSound.setEnabled).toHaveBeenCalledExactlyOnceWith(false);
    expect(notify).not.toHaveBeenCalled();
  });

  it.each([
    ['a 1:1 chat', 'direct'],
    ['a group chat', 'group'],
  ])('has no sound toggle inside %s, because the sound is muted for the whole chat', (_name, conversationId) => {
    state.selectedConversationId = conversationId;
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onToggleSound).toBeUndefined();
  });

  it('unmutes when the sound is off, and reports a failed save once', async () => {
    chatSound.enabled = false;
    chatSound.setEnabled = vi.fn().mockRejectedValue(new Error('network'));
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.soundMuted).toBe(true);

    panelProps.onToggleSound?.();

    expect(chatSound.setEnabled).toHaveBeenCalledExactlyOnceWith(true);
    await vi.waitFor(() => expect(notify).toHaveBeenCalledExactlyOnceWith('panel.soundToggleError', 'error'));
  });

  it('has no sound toggle when the sound cannot be changed', () => {
    chatSound.setEnabled = undefined;
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onToggleSound).toBeUndefined();
  });

  it('keeps the notification-settings gear in the conversation list header', () => {
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onGoToSettings).toBeTypeOf('function');
  });

  it('passes translated expand / collapse labels to the panel', () => {
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.expandLabel).toBe('panel.expand');
    expect(panelProps.collapseLabel).toBe('panel.collapse');
  });

  it('a 1:1 chat header has no gear, no options menu and no title action', () => {
    state.selectedConversationId = 'direct';
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onGoToSettings).toBeUndefined();
    expect(menuProps).toBeUndefined();
    expect(panelProps.onTitleClick).toBeUndefined();
  });

  it('a group chat header has no gear; its options menu and its title both open the group settings', () => {
    state.selectedConversationId = 'group';
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onGoToSettings).toBeUndefined();

    expect(menuProps?.label).toBe('thread.options');
    menuProps?.onOpenSettings();
    expect(openGroupSettings).toHaveBeenCalledTimes(1);

    expect(panelProps.titleActionLabel).toBe('group.settings');
    panelProps.onTitleClick?.();
    expect(openGroupSettings).toHaveBeenCalledTimes(2);
  });

  it('leaving from the options menu asks for confirmation before leaving', async () => {
    state.selectedConversationId = 'group';
    const { rerender } = render(<UnifiedChatPanelConnector />);
    expect(lastLeaveConfirmation()?.open).toBe(false);

    menuProps?.onLeave();
    rerender(<UnifiedChatPanelConnector />);
    expect(leaveGroup).not.toHaveBeenCalled();
    expect(lastLeaveConfirmation()?.open).toBe(true);

    await lastLeaveConfirmation()?.onConfirm();
    expect(leaveGroup).toHaveBeenCalledTimes(1);
  });

  it('the group settings avatar shows the same members as the header and list (without the viewer)', () => {
    state.selectedConversationId = 'group';
    render(<UnifiedChatPanelConnector />);
    expect(groupAvatarMembers?.map(member => member.id)).toEqual(['u1', 'u2']);
  });
});
