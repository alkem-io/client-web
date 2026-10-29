import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AppSignInWelcome } from './AppSignInWelcome';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AppSignInWelcome', () => {
  test('shows the brand and copy as plain text, with no notice box', () => {
    render(<AppSignInWelcome signInHref="/in" createAccountHref="/up" />);

    expect(screen.getByRole('heading', { level: 1, name: 'tagline' })).toBeInTheDocument();
    expect(screen.getByText('appWelcome.body')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('links sign in and create account to the given hrefs', () => {
    render(<AppSignInWelcome signInHref="/in" createAccountHref="/up" browseSpacesHref="/spaces" />);

    expect(screen.getByRole('link', { name: 'appWelcome.signIn' })).toHaveAttribute('href', '/in');
    expect(screen.getByRole('link', { name: 'appWelcome.createAccount' })).toHaveAttribute('href', '/up');
    expect(screen.getByRole('link', { name: 'appWelcome.browseSpaces' })).toHaveAttribute('href', '/spaces');
  });

  test('omits the browse link when no href is given', () => {
    render(<AppSignInWelcome signInHref="/in" createAccountHref="/up" />);

    expect(screen.queryByRole('link', { name: 'appWelcome.browseSpaces' })).not.toBeInTheDocument();
  });
});
