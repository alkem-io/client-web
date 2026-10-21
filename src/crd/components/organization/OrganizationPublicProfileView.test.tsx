import { render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import {
  OrganizationPublicProfileView,
  type OrganizationPublicProfileViewProps,
} from './OrganizationPublicProfileView';

const baseProps: OrganizationPublicProfileViewProps = {
  hero: {
    avatarImageUrl: null,
    color: '#42a5f5',
    displayName: 'Acme Corp',
    tagline: null,
    location: null,
    verified: false,
    settingsHref: null,
    onSendMessage: null,
  },
  sidebar: {
    bio: null,
    tagsets: [],
    references: [],
    associates: { associates: [], totalCount: 0, canReadUsers: false },
    labels: {
      bioTitle: 'Bio',
      bioEmpty: 'No bio yet.',
      referencesTitle: 'Links',
      associatesTitle: count => `${count} associates`,
      associatesSignInCta: 'Sign in to view associates.',
      associatesShowMore: count => `Show more (${count})`,
      associatesShowLess: 'Show less',
      socialLinksTitle: 'Social',
    },
  },
  tabStrip: {
    tabs: [{ key: 'memberOf', label: 'All Memberships' }],
    activeTab: 'memberOf',
    onSelectTab: () => {},
    ariaLabel: 'Organization profile resource tabs',
  },
  rightColumn: {
    activeTab: 'memberOf',
    hostedVirtualContributors: [],
    hostedInnovationPacks: [],
    hostedInnovationHubs: [],
    leadSpaces: [],
    memberOf: [],
    labels: {
      virtualContributorsSubsection: 'Virtual Contributors',
      templatePacksSubsection: 'Template Packs',
      customHomepagesSubsection: 'Custom Homepages',
      spacesLeading: 'Lead Spaces',
      memberOf: 'All Memberships',
      emptyMembership: 'No memberships yet.',
    },
  },
  loading: { hero: false, sidebar: false, hostedResources: false, memberships: false },
  loadingLabels: {
    hero: 'Loading profile header',
    sidebar: 'Loading profile details',
    hostedResources: 'Loading hosted resources',
    memberships: 'Loading memberships',
  },
};

const NOTICE = 'Sign up on Alkemio to see the resources hosted by Acme Corp';

describe('OrganizationPublicProfileView — guest notice slot', () => {
  beforeAll(() => {
    // jsdom does not implement scrollIntoView; the tab strip calls it on mount.
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => vi.clearAllMocks());

  test('renders the guest notice above the resource tab strip', () => {
    render(<OrganizationPublicProfileView {...baseProps} guestNotice={<p>{NOTICE}</p>} />);
    const notice = screen.getByText(NOTICE);
    const tablist = screen.getByRole('tablist');
    // Node.DOCUMENT_POSITION_FOLLOWING === 4: the tab strip comes after the notice.
    expect(notice.compareDocumentPosition(tablist) & 4).toBeTruthy();
  });

  test('renders the guest notice while the resource sections are still loading', () => {
    render(
      <OrganizationPublicProfileView
        {...baseProps}
        loading={{ ...baseProps.loading, hostedResources: true }}
        guestNotice={<p>{NOTICE}</p>}
      />
    );
    expect(screen.getByText(NOTICE)).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  test('renders no notice when none is passed', () => {
    render(<OrganizationPublicProfileView {...baseProps} />);
    expect(screen.queryByText(NOTICE)).toBeNull();
    expect(screen.getByRole('tablist')).toBeTruthy();
  });
});
