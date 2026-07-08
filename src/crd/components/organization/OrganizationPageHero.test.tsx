import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { OrganizationPageHero } from './OrganizationPageHero';

const baseProps = {
  avatarImageUrl: null,
  color: '#42a5f5',
  displayName: 'Acme Corp',
  tagline: null,
  location: null,
  verified: false,
  settingsHref: null,
  onSendMessage: null,
};

describe('OrganizationPageHero — tagline (FR-020)', () => {
  afterEach(() => vi.clearAllMocks());

  const TAGLINE = 'Building open innovation ecosystems';

  test('renders the tagline under the display name when provided', () => {
    render(<OrganizationPageHero {...baseProps} tagline={TAGLINE} />);
    expect(screen.getByText(TAGLINE)).toBeTruthy();
  });

  test('omits the tagline paragraph when tagline is null', () => {
    render(<OrganizationPageHero {...baseProps} tagline={null} />);
    expect(screen.queryByText(TAGLINE)).toBeNull();
  });
});
