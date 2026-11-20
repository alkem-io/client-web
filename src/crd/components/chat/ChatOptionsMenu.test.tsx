import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ChatOptionsMenu } from './ChatOptionsMenu';

const renderMenu = () => {
  const onOpenSettings = vi.fn();
  const onLeave = vi.fn();
  render(
    <ChatOptionsMenu
      label="Chat options"
      settingsLabel="Group settings"
      onOpenSettings={onOpenSettings}
      leaveLabel="Leave group"
      onLeave={onLeave}
    />
  );
  return { onOpenSettings, onLeave, user: userEvent.setup({ pointerEventsCheck: 0 }) };
};

describe('ChatOptionsMenu', () => {
  test('the trigger is a button named by its label and announces a menu', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Chat options' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  test('opening it from the keyboard offers the chat settings and leaving', async () => {
    const { user, onOpenSettings } = renderMenu();
    const trigger = screen.getByRole('button', { name: 'Chat options' });
    act(() => trigger.focus());
    await user.keyboard('{Enter}');

    const items = screen.getAllByRole('menuitem').map(item => item.textContent);
    expect(items).toEqual(['Group settings', 'Leave group']);

    await user.click(screen.getByRole('menuitem', { name: 'Group settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  test('choosing leave calls onLeave (the consumer confirms before leaving)', async () => {
    const { user, onLeave, onOpenSettings } = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Chat options' }));
    await user.click(screen.getByRole('menuitem', { name: 'Leave group' }));
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).not.toHaveBeenCalled();
  });
});
