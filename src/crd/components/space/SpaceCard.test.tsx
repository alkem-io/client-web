import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { SpaceCard, type SpaceCardData } from './SpaceCard';

/**
 * Characterisation tests for `SpaceCard`.
 *
 * `SpaceCard` had zero tests before this feature and ~15 consumers across the
 * app (explorer, search overlay, dashboard, innovation hub, subspaces dialog,
 * settings about view, the Subspaces-collection callout). These tests pin its
 * CURRENT rendered output against a full fixture BEFORE `SpaceCardIdentity` /
 * `SpaceCardLeads` are extracted from it, so the extraction can be verified to
 * change nothing — every assertion here must still pass, unedited, after the
 * refactor ("everything the compact card shows" holds by
 * construction, not by copy).
 */

const fullFixture: SpaceCardData = {
  id: 'space-1',
  name: 'Alpha Subspace',
  description: 'A short tagline for Alpha',
  bannerImageUrl: 'https://example.org/banner.png',
  avatarUrl: 'https://example.org/avatar.png',
  initials: 'AS',
  avatarColor: '#42a5f5',
  isPrivate: false,
  isMember: true,
  isPinned: true,
  tags: ['one', 'two'],
  leads: [
    { name: 'Lead One', avatarUrl: '', type: 'person' },
    { name: 'Lead Two', avatarUrl: '', type: 'org' },
  ],
  href: '/space/alpha',
  parent: {
    name: 'Parent Space',
    href: '/space/parent',
    initials: 'PS',
    avatarColor: '#66bb6a',
  },
  status: 'active',
  visibility: 'active',
};

// Every multi-render test below manages cleanup explicitly between renders (rather than
// relying on the global afterEach) so `screen`-wide queries never see two mounted copies
// of the card at once.
afterEach(() => {
  cleanup();
});

describe('SpaceCard (characterisation)', () => {
  test('renders a banner image when bannerImageUrl is set (not the gradient fallback)', () => {
    const { container } = render(<SpaceCard space={fullFixture} />);
    expect(container.querySelector('.aspect-video img')).not.toBeNull();
  });

  test('renders the gradient fallback when bannerImageUrl is missing', () => {
    const { container } = render(<SpaceCard space={{ ...fullFixture, bannerImageUrl: undefined }} />);
    expect(container.querySelector('.aspect-video img')).toBeNull();
  });

  test('shows a visibility ribbon for a non-active visibility, none for active', () => {
    const { container: demo } = render(<SpaceCard space={{ ...fullFixture, visibility: 'demo' }} />);
    expect(demo.textContent).toContain('crd-common:visibility.demo');
    cleanup();
    const { container: active } = render(<SpaceCard space={fullFixture} />);
    expect(active.textContent).not.toContain('crd-common:visibility.active');
  });

  test('shows the Member badge when isMember is true', () => {
    render(<SpaceCard space={fullFixture} />);
    expect(screen.getByText('crd-common:member')).toBeInTheDocument();
  });

  test('shows the pin indicator when isPinned is true (sr-only label)', () => {
    render(<SpaceCard space={fullFixture} />);
    expect(screen.getByText('crd-common:pinned')).toBeInTheDocument();
  });

  test('shows Public/Private badge matching isPrivate', () => {
    const { container: pub } = render(<SpaceCard space={{ ...fullFixture, isPrivate: false }} />);
    expect(within(pub).getByText('crd-common:public')).toBeInTheDocument();
    cleanup();
    const { container: priv } = render(<SpaceCard space={{ ...fullFixture, isPrivate: true }} />);
    expect(within(priv).getByText('crd-common:private')).toBeInTheDocument();
  });

  test('renders the avatar block by default (initials, no avatarUrl), and suppresses it when hideAvatar is set', () => {
    const noAvatarUrl = { ...fullFixture, avatarUrl: undefined };
    const { container: shown } = render(<SpaceCard space={noAvatarUrl} />);
    expect(shown.textContent).toContain('AS');
    cleanup();
    const { container: hidden } = render(<SpaceCard space={{ ...noAvatarUrl, hideAvatar: true }} />);
    expect(hidden.textContent).not.toContain('AS');
  });

  test('renders the name, parent line, tagline and tags', () => {
    const { container } = render(<SpaceCard space={fullFixture} />);
    expect(screen.getByText('Alpha Subspace')).toBeInTheDocument();
    expect(screen.getByText('Parent Space')).toBeInTheDocument();
    expect(screen.getByText('A short tagline for Alpha')).toBeInTheDocument();
    // Scoped to the real (visible) tag list — CollapsibleTagList also renders an
    // aria-hidden measurement mirror carrying the same tag text.
    const visibleTags = container.querySelector('ul[role="list"]');
    expect(visibleTags).not.toBeNull();
    expect(within(visibleTags as HTMLElement).getByText('one')).toBeInTheDocument();
    expect(within(visibleTags as HTMLElement).getByText('two')).toBeInTheDocument();
  });

  test('renders the leads footer with up to 4 avatars, and an overflow chip beyond that', () => {
    const manyLeads = Array.from({ length: 7 }, (_, i) => ({
      name: `Lead ${i}`,
      avatarUrl: '',
      type: 'person' as const,
    }));
    render(<SpaceCard space={{ ...fullFixture, leads: manyLeads }} />);
    expect(screen.getByText('crd-common:leads')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  test('omits the leads footer entirely when there are no leads', () => {
    render(<SpaceCard space={{ ...fullFixture, leads: [] }} />);
    expect(screen.queryByText('crd-common:leads')).toBeNull();
  });

  test('is a single wrapping <a href> whose onClick is intercepted when a handler is provided', () => {
    const onClick = vi.fn();
    const { container } = render(<SpaceCard space={fullFixture} onClick={onClick} />);
    const links = container.querySelectorAll('a[href]');
    // The card's own outer link, plus none other at this level (the parent-space
    // control is a <button>, not a second <a>).
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/space/alpha');
    links[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).toHaveBeenCalledWith(fullFixture);
  });
});
