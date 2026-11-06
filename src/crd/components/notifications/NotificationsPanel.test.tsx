import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { NotificationsPanel } from './NotificationsPanel';

beforeAll(() => {
  // jsdom does not lay out, so elements have no scrollTo; the panel scrolls the list back to the top.
  Element.prototype.scrollTo = vi.fn();
});

const renderPanel = (props: { hasNewNotifications?: boolean; onShowNewNotifications?: () => void }) =>
  render(
    <NotificationsPanel
      open={true}
      onClose={vi.fn()}
      items={[]}
      filters={[]}
      selectedFilter="ALL"
      onFilterChange={vi.fn()}
      onMarkAllRead={vi.fn()}
      onLoadMore={vi.fn()}
      {...props}
    />
  );

describe('NotificationsPanel — newer notifications', () => {
  it('offers them and asks for them on click', async () => {
    const onShowNewNotifications = vi.fn();
    renderPanel({ hasNewNotifications: true, onShowNewNotifications });

    await userEvent.click(screen.getByRole('button', { name: 'notifications.newNotifications' }));

    expect(onShowNewNotifications).toHaveBeenCalledTimes(1);
    expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('offers nothing when there is nothing newer', () => {
    renderPanel({ hasNewNotifications: false, onShowNewNotifications: vi.fn() });

    expect(screen.queryByRole('button', { name: 'notifications.newNotifications' })).not.toBeInTheDocument();
  });
});
