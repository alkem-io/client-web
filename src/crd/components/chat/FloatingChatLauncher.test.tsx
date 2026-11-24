import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FloatingChatLauncher } from './FloatingChatLauncher';

const labels = { openLabel: 'Open chat', closeLabel: 'Close chat', unreadLabel: 'Unread', onClick: () => {} };

it('is a plain chat button when nobody is calling', () => {
  render(<FloatingChatLauncher {...labels} isOpen={false} />);
  expect(screen.getByRole('button', { name: 'Open chat' })).not.toHaveAttribute('data-ringing');
});

it('rings and names the caller while closed', () => {
  render(<FloatingChatLauncher {...labels} isOpen={false} incomingCallLabel="Maria is calling you" />);
  expect(screen.getByRole('button', { name: 'Maria is calling you. Open chat' })).toHaveAttribute(
    'data-ringing',
    'true'
  );
});

it('does not ring once the chat is open: the panel shows the call', () => {
  render(<FloatingChatLauncher {...labels} isOpen={true} incomingCallLabel="Maria is calling you" />);
  expect(screen.getByRole('button', { name: 'Close chat' })).not.toHaveAttribute('data-ringing');
});
