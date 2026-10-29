import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AppSignInWelcome } from './AppSignInWelcome';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AppSignInWelcome', () => {
  test('shows the brand and copy as plain text, with no notice box', () => {
    render(<AppSignInWelcome signInHref="/in" />);

    expect(screen.getByRole('heading', { level: 1, name: 'tagline' })).toBeInTheDocument();
    expect(screen.getByText('appWelcome.body')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('links sign in and create account to the given hrefs', () => {
    render(<AppSignInWelcome signInHref="/in" browseSpacesHref="/spaces" />);

    expect(screen.getByRole('link', { name: 'appWelcome.signIn' })).toHaveAttribute('href', '/in');
    expect(screen.getByRole('link', { name: 'appWelcome.browseSpaces' })).toHaveAttribute('href', '/spaces');
    // No sign-up entry: in the app it would open sign-in, not registration.
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  test('omits the browse link when no href is given', () => {
    render(<AppSignInWelcome signInHref="/in" />);

    expect(screen.queryByRole('link', { name: 'appWelcome.browseSpaces' })).not.toBeInTheDocument();
  });

  test('shows no message by default', () => {
    render(<AppSignInWelcome signInHref="/in" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('an info message is plain muted text announced politely', () => {
    render(<AppSignInWelcome signInHref="/in" message={{ text: 'cancelled', tone: 'info' }} />);

    const message = screen.getByRole('status');
    expect(message).toHaveTextContent('cancelled');
    expect(message).toHaveClass('text-caption', 'text-muted-foreground');
    expect(message.className).not.toMatch(/\bbg-/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('a destructive message is plain red text announced assertively', () => {
    render(<AppSignInWelcome signInHref="/in" message={{ text: 'failed', tone: 'destructive' }} />);

    const message = screen.getByRole('alert');
    expect(message).toHaveTextContent('failed');
    expect(message).toHaveClass('text-caption', 'text-destructive');
    expect(message.className).not.toMatch(/\bbg-/);
  });

  test('the message sits directly above the buttons', () => {
    render(<AppSignInWelcome signInHref="/in" message={{ text: 'failed', tone: 'destructive' }} />);

    const signIn = screen.getByRole('link', { name: 'appWelcome.signIn' });
    expect(screen.getByRole('alert').nextElementSibling).toContainElement(signIn);
  });
});
