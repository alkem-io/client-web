import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ChatPanel } from './ChatPanel';

const screenSize = { isSmallScreen: false, isMediumScreen: false, isLargeScreen: true };
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useScreenSize: () => screenSize }));

const baseProps: ComponentProps<typeof ChatPanel> = {
  open: true,
  title: 'Design team',
  onClose: () => {},
  closeLabel: 'Close chat',
  backLabel: 'Back to conversations',
  settingsLabel: 'Notification settings',
  children: <div>body</div>,
};

const renderPanel = (props: Partial<ComponentProps<typeof ChatPanel>> = {}) =>
  render(<ChatPanel {...baseProps} {...props} />);

describe('ChatPanel', () => {
  beforeEach(() => {
    screenSize.isSmallScreen = false;
  });

  describe('header', () => {
    test('shows the notification-settings gear only when the consumer passes onGoToSettings', () => {
      const { rerender } = renderPanel();
      expect(screen.queryByRole('button', { name: 'Notification settings' })).not.toBeInTheDocument();
      rerender(<ChatPanel {...baseProps} onGoToSettings={() => {}} />);
      expect(screen.getByRole('button', { name: 'Notification settings' })).toBeInTheDocument();
    });

    test('the title is plain text when there is no title action', () => {
      renderPanel({ titleAvatar: <span data-testid="title-avatar" /> });
      expect(screen.queryByRole('button', { name: /Design team/ })).not.toBeInTheDocument();
      expect(screen.getByText('Design team')).toBeInTheDocument();
    });

    test('with a title action, the avatar and title become one button that names the title and the action', async () => {
      const onTitleClick = vi.fn();
      renderPanel({
        titleAvatar: <span data-testid="title-avatar" />,
        onTitleClick,
        titleActionLabel: 'Group settings',
      });
      const button = screen.getByRole('button', { name: /^Design team\W+Group settings$/ });
      expect(button).toContainElement(screen.getByTestId('title-avatar'));

      await userEvent.setup().click(screen.getByTestId('title-avatar'));
      expect(onTitleClick).toHaveBeenCalledTimes(1);
    });
  });
});
