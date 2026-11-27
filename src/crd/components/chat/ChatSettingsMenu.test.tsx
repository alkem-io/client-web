import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ChatSettingsMenu, type ChatSettingsMenuToggles } from './ChatSettingsMenu';

const renderMenu = (toggles: ChatSettingsMenuToggles = {}, showOnline = true) => {
  const onEditStatus = vi.fn();
  const onOpenNotificationSettings = vi.fn();
  const onShowOnlineChange = vi.fn();
  render(
    <ChatSettingsMenu
      {...toggles}
      label="Notification settings"
      showOnlineLabel="Show when I'm online"
      showOnline={showOnline}
      onShowOnlineChange={onShowOnlineChange}
      statusLabel="Set status"
      onEditStatus={onEditStatus}
      notificationSettingsLabel="Notification settings"
      onOpenNotificationSettings={onOpenNotificationSettings}
    />
  );
  return {
    onEditStatus,
    onOpenNotificationSettings,
    onShowOnlineChange,
    user: userEvent.setup({ pointerEventsCheck: 0 }),
  };
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

  test('given the expand toggle, lists it first and calls only the chosen one', async () => {
    const onExpand = vi.fn();
    const { user, onEditStatus } = renderMenu({ expand: { label: 'Expand chat', onSelect: onExpand } });
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual([
      'Expand chat',
      'Set status',
      'Notification settings',
    ]);

    await user.click(screen.getByRole('menuitem', { name: 'Expand chat' }));
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onEditStatus).not.toHaveBeenCalled();
  });

  test('the online setting is a checked item while on, and choosing it turns it off only', async () => {
    const { user, onShowOnlineChange, onEditStatus } = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    const item = screen.getByRole('menuitemcheckbox', { name: "Show when I'm online" });
    expect(item).toHaveAttribute('aria-checked', 'true');

    await user.click(item);
    expect(onShowOnlineChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onEditStatus).not.toHaveBeenCalled();
  });

  test('while the online setting is off, it is unchecked, there is no status to set, and choosing it turns it on', async () => {
    const { user, onShowOnlineChange } = renderMenu({}, false);
    await user.click(screen.getByRole('button', { name: 'Notification settings' }));
    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual(['Notification settings']);
    const item = screen.getByRole('menuitemcheckbox', { name: "Show when I'm online" });
    expect(item).toHaveAttribute('aria-checked', 'false');

    await user.click(item);
    expect(onShowOnlineChange).toHaveBeenCalledExactlyOnceWith(true);
  });
});
