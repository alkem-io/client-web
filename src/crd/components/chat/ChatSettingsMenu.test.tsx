import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ChatSettingsMenu, type ChatSettingsMenuToggles } from './ChatSettingsMenu';

const renderMenu = (toggles: ChatSettingsMenuToggles = {}) => {
  const onEditStatus = vi.fn();
  const onOpenNotificationSettings = vi.fn();
  render(
    <ChatSettingsMenu
      {...toggles}
      label="Notification settings"
      statusLabel="Set status"
      onEditStatus={onEditStatus}
      notificationSettingsLabel="Notification settings"
      onOpenNotificationSettings={onOpenNotificationSettings}
    />
  );
  return { onEditStatus, onOpenNotificationSettings, user: userEvent.setup({ pointerEventsCheck: 0 }) };
};

describe('ChatSettingsMenu', () => {
  test('the gear is a button named by its label that opens a menu with the status and the notification settings', async () => {
    const { user } = renderMenu();
    const trigger = screen.getByRole('button', { name: 'Notification settings' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    await user.click(trigger);
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual([
      'Set status',
      'Notification settings',
    ]);
  });

  test('choosing the status item opens the status editor only', async () => {
    const { user, onEditStatus, onOpenNotificationSettings } = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set status' }));

    expect(onEditStatus).toHaveBeenCalledTimes(1);
    expect(onOpenNotificationSettings).not.toHaveBeenCalled();
  });

  test('choosing the notification settings item opens them only', async () => {
    const { user, onEditStatus, onOpenNotificationSettings } = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    await user.click(screen.getByRole('menuitem', { name: 'Notification settings' }));

    expect(onOpenNotificationSettings).toHaveBeenCalledTimes(1);
    expect(onEditStatus).not.toHaveBeenCalled();
  });

  test('given the panel toggles, lists expand and sound first and calls only the chosen one', async () => {
    const onExpand = vi.fn();
    const onSound = vi.fn();
    const { user, onEditStatus } = renderMenu({
      expand: { label: 'Expand chat', onSelect: onExpand },
      sound: { label: 'Mute chat sound', muted: false, onSelect: onSound },
    });
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual([
      'Expand chat',
      'Mute chat sound',
      'Set status',
      'Notification settings',
    ]);
    expect(screen.getByRole('menuitem', { name: 'Mute chat sound' }).querySelector('.lucide-volume-2')).not.toBeNull();

    await user.click(screen.getByRole('menuitem', { name: 'Expand chat' }));
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onSound).not.toHaveBeenCalled();
    expect(onEditStatus).not.toHaveBeenCalled();
  });

  test('a muted sound item shows the muted icon and calls its handler', async () => {
    const onSound = vi.fn();
    const { user } = renderMenu({ sound: { label: 'Unmute chat sound', muted: true, onSelect: onSound } });
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    const item = screen.getByRole('menuitem', { name: 'Unmute chat sound' });
    expect(item.querySelector('.lucide-volume-x')).not.toBeNull();

    await user.click(item);
    expect(onSound).toHaveBeenCalledTimes(1);
  });
});
