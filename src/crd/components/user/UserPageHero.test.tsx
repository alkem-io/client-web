import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { UserPageHero } from './UserPageHero';

const baseProps = {
  avatarImageUrl: null,
  color: '#42a5f5',
  displayName: 'Jane Doe',
  tagline: null,
  location: null,
  showSettingsIcon: false,
};

describe('UserPageHero — contact affordances (FR-011)', () => {
  afterEach(() => vi.clearAllMocks());

  test('renders both Message and Email when chat and email are enabled', () => {
    render(<UserPageHero {...baseProps} onMessageClick={vi.fn()} onSendEmail={vi.fn()} />);
    expect(screen.getByText('userProfile.hero.messageButton')).toBeTruthy();
    expect(screen.getByText('userProfile.hero.emailButton')).toBeTruthy();
  });

  test('renders only Message when chat is enabled and email is not', () => {
    render(<UserPageHero {...baseProps} onMessageClick={vi.fn()} />);
    expect(screen.getByText('userProfile.hero.messageButton')).toBeTruthy();
    expect(screen.queryByText('userProfile.hero.emailButton')).toBeNull();
  });

  test('renders only Email when email is enabled and chat is not', () => {
    render(<UserPageHero {...baseProps} onSendEmail={vi.fn()} />);
    expect(screen.getByText('userProfile.hero.emailButton')).toBeTruthy();
    expect(screen.queryByText('userProfile.hero.messageButton')).toBeNull();
  });

  test('shows the cannot-be-reached label when neither route is available', () => {
    render(<UserPageHero {...baseProps} cannotBeReachedLabel="cannot reach" />);
    expect(screen.getByText('cannot reach')).toBeTruthy();
    expect(screen.queryByText('userProfile.hero.messageButton')).toBeNull();
    expect(screen.queryByText('userProfile.hero.emailButton')).toBeNull();
  });
});
