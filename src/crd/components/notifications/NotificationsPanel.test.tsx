import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationsPanel } from './NotificationsPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const screenSize = { isSmallScreen: false, isMediumScreen: false, isLargeScreen: true };
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useScreenSize: () => screenSize }));

const renderPanel = () => {
  const onClose = vi.fn();
  render(
    <NotificationsPanel
      open={true}
      onClose={onClose}
      items={[]}
      filters={[]}
      selectedFilter="all"
      onFilterChange={() => {}}
      onMarkAllRead={() => {}}
      onLoadMore={() => {}}
    />
  );
  return onClose;
};

describe('NotificationsPanel — full screen on a small screen', () => {
  afterEach(() => {
    screenSize.isSmallScreen = false;
  });

  const closeButtons = () => screen.getAllByRole('button', { name: 'notifications.close' });

  it('is pinned to the edges and keeps its corner close button', async () => {
    screenSize.isSmallScreen = true;
    const onClose = renderPanel();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('inset-0', 'translate-x-0', 'translate-y-0', 'border-none');
    expect(dialog).not.toHaveClass('top-[50%]', 'left-[50%]');

    // Same close control as the chat panel and as above a small screen: an X, not a back arrow.
    expect(closeButtons()).toHaveLength(1);
    expect(closeButtons()[0].querySelector('.lucide-x')).not.toBeNull();
    expect(dialog.querySelector('.lucide-chevron-left')).toBeNull();
    // The same target as the chat panel's X, not the dialog primitive's bare icon.
    expect(closeButtons()[0]).toHaveClass('size-9');
    expect(closeButtons()[0].querySelector('svg')).toHaveClass('size-6');
    expect(screen.getByRole('button', { name: 'notifications.markAllRead' })).toHaveClass('size-9');
    await userEvent.click(closeButtons()[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('stays a centered panel with its corner close button above a small screen', () => {
    renderPanel();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('top-[50%]', 'left-[50%]', 'sm:h-[560px]', 'sm:max-w-lg');
    expect(dialog).not.toHaveClass('inset-0');
    expect(closeButtons()).toHaveLength(1);
    expect(closeButtons()[0].querySelector('.lucide-x')).not.toBeNull();
    expect(closeButtons()[0]).toHaveClass('size-9');
    expect(dialog.querySelector('.lucide-chevron-left')).toBeNull();
  });
});
