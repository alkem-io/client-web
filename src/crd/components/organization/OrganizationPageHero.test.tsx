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

describe('OrganizationPageHero — associate action placement (FR-011, R44)', () => {
  afterEach(() => vi.clearAllMocks());

  test('renders the associate action in the hero action row, immediately before Message', () => {
    render(
      <OrganizationPageHero
        {...baseProps}
        onSendMessage={async () => {}}
        associateAction={<button type="button">Apply to associate</button>}
      />
    );
    const apply = screen.getByRole('button', { name: 'Apply to associate' });
    const message = screen.getByRole('button', { name: /orgProfile\.hero\.messageButton/ });
    // Same action row, Apply first: Carlos expected it "on the top right of the
    // Organization profile, next to the button that says Message".
    expect(apply.parentElement).toBe(message.parentElement);
    // Node.DOCUMENT_POSITION_FOLLOWING === 4.
    expect(apply.compareDocumentPosition(message) & 4).toBeTruthy();
  });

  test('renders no associate action when the viewer has none (already an associate)', () => {
    render(<OrganizationPageHero {...baseProps} onSendMessage={async () => {}} />);
    expect(screen.queryByRole('button', { name: 'Apply to associate' })).toBeNull();
  });
});

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
