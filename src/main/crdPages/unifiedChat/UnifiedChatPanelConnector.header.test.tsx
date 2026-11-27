import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserPresencePopover } from '@/crd/components/chat/UserPresencePopover';
import { buildUserNotificationSettingsUrl } from '@/main/routing/urlBuilders';
import { UnifiedChatPanelConnector } from './UnifiedChatPanelConnector';

type Member = { id: string; displayName: string; avatarUri?: string; presence?: string; statusMessage?: string };
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
const navigate = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigate }));
const ownStatus = { statusMessage: '', setStatusMessage: vi.fn() };
vi.mock('@/main/userMessaging/matrix/useMatrixPresence', async importOriginal => ({
  ...(await importOriginal<typeof import('@/main/userMessaging/matrix/useMatrixPresence')>()),
  useOwnStatusMessage: () => ownStatus,
}));
const showOnlinePreference = { showOnline: true, setShowOnline: vi.fn() };
vi.mock('@/main/userMessaging/matrix/useShowOnlinePreference', () => ({
  useShowOnlinePreference: () => showOnlinePreference,
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
  settingsMenu?: (toggles: object) => ReactNode;
  subtitle?: ReactNode;
  onToggleSound?: () => void;
  soundMuted?: boolean;
  muteSoundLabel: string;
  unmuteSoundLabel: string;
  onTitleClick?: () => void;
  titleActionLabel?: string;
  titleAvatar?: ReactNode;
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
        {props.subtitle}
        {props.headerActions}
        {props.settingsMenu?.({})}
        {props.children}
      </>
    );
  },
}));

type SettingsMenuProps = {
  label: string;
  showOnlineLabel: string;
  showOnline: boolean;
  onShowOnlineChange: (showOnline: boolean) => void;
  statusLabel: string;
  onEditStatus: () => void;
  notificationSettingsLabel: string;
  onOpenNotificationSettings: () => void;
};
let settingsMenuProps: SettingsMenuProps | undefined;
vi.mock('@/crd/components/chat/ChatSettingsMenu', () => ({
  ChatSettingsMenu: (props: SettingsMenuProps) => {
    settingsMenuProps = props;
    return null;
  },
}));

type StatusDialogProps = { open: boolean; statusMessage: string; onSave: (statusMessage: string) => void };
let statusDialogProps: StatusDialogProps | undefined;
vi.mock('@/crd/components/chat/SetStatusDialog', () => ({
  SetStatusDialog: (props: StatusDialogProps) => {
    statusDialogProps = props;
    return null;
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
    { id: 'u1', displayName: 'Ann', presence: 'online', statusMessage: 'In a workshop' },
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
    settingsMenuProps = undefined;
    statusDialogProps = undefined;
    navigate.mockClear();
    ownStatus.statusMessage = '';
    ownStatus.setStatusMessage = vi.fn().mockResolvedValue(undefined);
    showOnlinePreference.showOnline = true;
    showOnlinePreference.setShowOnline = vi.fn().mockResolvedValue(undefined);
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
  ])('has no sound toggle inside %s, where it would read as muting that chat', (_name, conversationId) => {
    state.selectedConversationId = conversationId;
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onToggleSound).toBeUndefined();
  });

  it('unmutes when the sound is off, adding no message of its own when the save fails', async () => {
    chatSound.enabled = false;
    chatSound.setEnabled = vi.fn().mockRejectedValue(new Error('network'));
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.soundMuted).toBe(true);

    panelProps.onToggleSound?.();

    expect(chatSound.setEnabled).toHaveBeenCalledExactlyOnceWith(true);
    await Promise.resolve();
    expect(notify).not.toHaveBeenCalled();
  });

  it('has no sound toggle when the sound cannot be changed', () => {
    chatSound.setEnabled = undefined;
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.onToggleSound).toBeUndefined();
  });

  it('the list header gear menu still opens the notification settings', () => {
    render(<UnifiedChatPanelConnector />);
    expect(settingsMenuProps?.label).toBe('panel.settings');
    expect(settingsMenuProps?.notificationSettingsLabel).toBe('panel.settings');

    settingsMenuProps?.onOpenNotificationSettings();

    expect(navigate).toHaveBeenCalledExactlyOnceWith(buildUserNotificationSettingsUrl());
    expect(statusDialogProps?.open).toBe(false);
  });

  it('without a status, the gear menu offers to set one and opens the status dialog; the header shows no status', () => {
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.subtitle).toBeUndefined();
    expect(settingsMenuProps?.statusLabel).toBe('status.set');
    expect(statusDialogProps).toMatchObject({ open: false, statusMessage: '' });

    act(() => settingsMenuProps?.onEditStatus());

    expect(statusDialogProps?.open).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('with a status, the list header shows it and pressing it opens the status dialog', async () => {
    ownStatus.statusMessage = 'In a workshop';
    render(<UnifiedChatPanelConnector />);
    expect(settingsMenuProps?.statusLabel).toBe('status.change');
    expect(statusDialogProps?.open).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'status.edit' }));

    expect(statusDialogProps).toMatchObject({ open: true, statusMessage: 'In a workshop' });
  });

  it('saving from the status dialog sets the status, and a failed save is reported once', async () => {
    render(<UnifiedChatPanelConnector />);
    statusDialogProps?.onSave('Lunch');
    expect(ownStatus.setStatusMessage).toHaveBeenCalledExactlyOnceWith('Lunch');
    expect(notify).not.toHaveBeenCalled();

    ownStatus.setStatusMessage = vi.fn().mockRejectedValue(new Error('rate limited'));
    statusDialogProps?.onSave('Lunch');
    await vi.waitFor(() => expect(notify).toHaveBeenCalledExactlyOnceWith('status.saveError', 'error'));
  });

  it('the gear menu shows the online setting and changes it', async () => {
    render(<UnifiedChatPanelConnector />);
    expect(settingsMenuProps).toMatchObject({ showOnlineLabel: 'status.showOnline', showOnline: true });

    settingsMenuProps?.onShowOnlineChange(false);
    expect(showOnlinePreference.setShowOnline).toHaveBeenCalledExactlyOnceWith(false);
    await Promise.resolve();
    expect(notify).not.toHaveBeenCalled();
  });

  it('a failed change of the online setting is reported once', async () => {
    showOnlinePreference.setShowOnline = vi.fn().mockRejectedValue(new Error('rate limited'));
    render(<UnifiedChatPanelConnector />);
    settingsMenuProps?.onShowOnlineChange(false);
    await vi.waitFor(() => expect(notify).toHaveBeenCalledExactlyOnceWith('status.showOnlineSaveError', 'error'));
  });

  it('while the online setting is off, the header shows no status and the status dialog never opens', () => {
    showOnlinePreference.showOnline = false;
    ownStatus.statusMessage = 'In a workshop';
    render(<UnifiedChatPanelConnector />);
    expect(settingsMenuProps?.showOnline).toBe(false);
    expect(panelProps.subtitle).toBeUndefined();

    act(() => settingsMenuProps?.onEditStatus());

    expect(statusDialogProps?.open).toBe(false);
  });

  it.each([
    ['a 1:1 chat', 'direct'],
    ['a group chat', 'group'],
  ])('%s header does not show your status, and its gear menu still offers to change it', (_name, conversationId) => {
    ownStatus.statusMessage = 'Out for lunch';
    state.selectedConversationId = conversationId;
    render(<UnifiedChatPanelConnector />);
    expect(screen.queryByText('Out for lunch')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'status.edit' })).not.toBeInTheDocument();
    expect(settingsMenuProps?.statusLabel).toBe('status.change');
  });

  it('hands the panel toggles it is given on to the gear menu', () => {
    state.selectedConversationId = 'direct';
    render(<UnifiedChatPanelConnector />);
    const expand = { label: 'panel.expand', onSelect: vi.fn() };
    render(<div>{panelProps.settingsMenu?.({ expand })}</div>);
    expect(settingsMenuProps).toMatchObject({ expand, label: 'panel.settings' });
  });

  it('passes translated expand / collapse labels to the panel', () => {
    render(<UnifiedChatPanelConnector />);
    expect(panelProps.expandLabel).toBe('panel.expand');
    expect(panelProps.collapseLabel).toBe('panel.collapse');
  });

  it('a 1:1 chat header has no options menu and no title action', () => {
    state.selectedConversationId = 'direct';
    render(<UnifiedChatPanelConnector />);
    expect(menuProps).toBeUndefined();
    expect(panelProps.onTitleClick).toBeUndefined();
  });

  it('a 1:1 chat header avatar opens the counterpart card with their status message and presence', () => {
    state.selectedConversationId = 'direct';
    render(<UnifiedChatPanelConnector />);
    const titleAvatar = panelProps.titleAvatar as ReactElement<Record<string, unknown>>;
    expect(titleAvatar.type).toBe(UserPresencePopover);
    expect(titleAvatar.props).toMatchObject({
      displayName: 'Ann',
      statusMessage: 'In a workshop',
      presence: 'online',
    });
  });

  it('a group chat header avatar is the plain conversation avatar', () => {
    state.selectedConversationId = 'group';
    render(<UnifiedChatPanelConnector />);
    expect((panelProps.titleAvatar as ReactElement).type).not.toBe(UserPresencePopover);
  });

  it('a group chat header options menu and its title both open the group settings', () => {
    state.selectedConversationId = 'group';
    render(<UnifiedChatPanelConnector />);

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
