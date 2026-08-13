import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type NotificationGroupData, type SoundGroupData, UserNotificationsTabView } from './UserNotificationsTabView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const soundGroup: SoundGroupData = {
  groupId: 'sound',
  title: 'Sounds',
  description: 'Sound preferences',
  rows: [],
};

const baseProps = {
  loading: false,
  pushAvailable: false,
  pushSubscribed: false,
  pushLoading: false,
  pushPermissionDenied: false,
  pushRequiresPwa: false,
  onPushMasterToggle: vi.fn(),
  soundGroup,
  onToggleSound: vi.fn(),
};

// Locates the row's outer container from its label text so the two switches
// inside a row (in-app, email) can be queried in isolation from the other
// row's switches. In-app is always the first switch rendered per row.
const getRowContainer = (label: string) => {
  const labelEl = screen.getByText(label);
  const container = labelEl.parentElement?.parentElement;
  if (!container) throw new Error(`could not resolve row container for "${label}"`);
  return container;
};

describe('UserNotificationsTabView — locked in-app cell (US3, contract C-5)', () => {
  const lockedCaption = 'In-app is always on for chat — see the chat panel instead.';

  const groups: NotificationGroupData[] = [
    {
      groupId: 'user',
      title: 'User',
      description: 'User notifications',
      rows: [
        {
          property: 'conversationMessageDirect',
          label: 'Direct messages',
          channels: { inApp: true, email: false, push: true },
          inAppLockedCaption: lockedCaption,
        },
        {
          property: 'commentReply',
          label: 'Comment replies',
          channels: { inApp: true, email: false, push: false },
        },
      ],
    },
  ];

  it('renders the locked row in-app switch as disabled and unchecked even though channels.inApp is true', () => {
    const onToggle = vi.fn();
    render(<UserNotificationsTabView {...baseProps} groups={groups} onToggle={onToggle} />);

    const row = getRowContainer('Direct messages');
    const inAppSwitch = within(row).getAllByRole('switch')[0];

    expect(inAppSwitch).toBeDisabled();
    expect(inAppSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('renders the locked caption and references it via aria-describedby on the in-app switch', () => {
    const onToggle = vi.fn();
    render(<UserNotificationsTabView {...baseProps} groups={groups} onToggle={onToggle} />);

    const row = getRowContainer('Direct messages');
    const inAppSwitch = within(row).getAllByRole('switch')[0];
    const caption = within(row).getByText(lockedCaption);

    expect(caption.id).toBeTruthy();
    expect(inAppSwitch).toHaveAttribute('aria-describedby', caption.id);
  });

  it('never calls onToggle for the locked row in-app switch on click', async () => {
    const onToggle = vi.fn();
    render(<UserNotificationsTabView {...baseProps} groups={groups} onToggle={onToggle} />);

    const row = getRowContainer('Direct messages');
    const inAppSwitch = within(row).getAllByRole('switch')[0];

    await userEvent.click(inAppSwitch);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('leaves the unlocked row in-app switch interactive (enabled, checked, no caption)', async () => {
    const onToggle = vi.fn();
    render(<UserNotificationsTabView {...baseProps} groups={groups} onToggle={onToggle} />);

    const row = getRowContainer('Comment replies');
    const inAppSwitch = within(row).getAllByRole('switch')[0];

    expect(inAppSwitch).not.toBeDisabled();
    expect(inAppSwitch).toHaveAttribute('aria-checked', 'true');
    expect(inAppSwitch).not.toHaveAttribute('aria-describedby');

    await userEvent.click(inAppSwitch);
    expect(onToggle).toHaveBeenCalledWith('user', 'commentReply', 'inApp', false);
  });
});
