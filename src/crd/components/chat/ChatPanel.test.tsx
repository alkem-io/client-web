import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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
  expandLabel: 'Expand chat',
  collapseLabel: 'Collapse chat',
  children: <div>body</div>,
};

const renderPanel = (props: Partial<ComponentProps<typeof ChatPanel>> = {}) =>
  render(<ChatPanel {...baseProps} {...props} />);

describe('ChatPanel', () => {
  beforeEach(() => {
    screenSize.isSmallScreen = false;
    document.body.style.overflow = '';
  });
  afterEach(() => {
    document.body.style.overflow = '';
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

  describe('expand / collapse', () => {
    test('expands to a centered dialog and collapses back with the same keyboard-operable button', async () => {
      const user = userEvent.setup();
      renderPanel();
      const dialog = screen.getByRole('dialog', { name: 'Design team' });
      expect(dialog).toHaveAttribute('data-expanded', 'false');

      const toggle = screen.getByRole('button', { name: 'Expand chat' });
      toggle.focus();
      await user.keyboard('{Enter}');

      expect(dialog).toHaveAttribute('data-expanded', 'true');
      expect(dialog.className).toContain('-translate-x-1/2');
      expect(toggle).toHaveAccessibleName('Collapse chat');
      expect(toggle).toHaveFocus();

      await user.keyboard(' ');
      expect(dialog).toHaveAttribute('data-expanded', 'false');
      expect(toggle).toHaveAccessibleName('Expand chat');
    });

    test('tells assistive technology whether the panel is expanded', async () => {
      renderPanel();
      const toggle = screen.getByRole('button', { name: 'Expand chat' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await userEvent.setup().click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('keeps the same body element across the toggle, so the open thread and its state survive', async () => {
      renderPanel({ children: <input aria-label="draft" defaultValue="unsent text" /> });
      const input = screen.getByRole('textbox', { name: 'draft' });
      await userEvent.setup().click(screen.getByRole('button', { name: 'Expand chat' }));
      expect(screen.getByRole('textbox', { name: 'draft' })).toBe(input);
      expect(input).toHaveValue('unsent text');
    });

    test('has no expand control on a small screen, where the panel is already full-screen', () => {
      screenSize.isSmallScreen = true;
      renderPanel();
      expect(screen.queryByRole('button', { name: 'Expand chat' })).not.toBeInTheDocument();
    });
  });

  describe('page scroll behind the panel', () => {
    test('leaves the page scrollable while the panel is the small floating window', () => {
      renderPanel();
      expect(document.body.style.overflow).toBe('');
    });

    test('locks page scroll while expanded and restores the previous value on collapse', async () => {
      document.body.style.overflow = 'scroll';
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Expand chat' }));
      expect(document.body.style.overflow).toBe('hidden');
      await user.click(screen.getByRole('button', { name: 'Collapse chat' }));
      expect(document.body.style.overflow).toBe('scroll');
    });

    test('locks page scroll while the panel covers a small screen and releases it on close', () => {
      screenSize.isSmallScreen = true;
      const { rerender } = renderPanel();
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<ChatPanel {...baseProps} open={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    test('leaves <html> alone, so a dialog that locks <body> does not reset the page scroll', async () => {
      renderPanel();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Expand chat' }));
      expect(document.documentElement.style.overflow).toBe('');
    });

    test('releases the lock when the panel unmounts while expanded', async () => {
      const { unmount } = renderPanel();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Expand chat' }));
      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
