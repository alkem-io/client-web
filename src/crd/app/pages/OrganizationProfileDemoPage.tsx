import { useState } from 'react';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { OrganizationPublicProfileView } from '@/crd/components/organization/OrganizationPublicProfileView';
import { SpaceGridCard } from '@/crd/components/user/SpaceGridCard';
import { MOCK_ORG_ALKEMIO } from '../data/profiles';

const SIDEBAR_LABELS = {
  bioTitle: 'Bio',
  bioEmpty: 'No bio yet.',
  referencesTitle: 'Links',
  referencesEmpty: 'No links yet.',
  associatesTitle: (count: number) => `${count} associates`,
  associatesSignInCta: 'Sign in to view associates.',
  associatesShowMore: (count: number) => `Show more (${count})`,
  associatesShowLess: 'Show less',
  socialLinksTitle: 'Social',
};

const SECTIONS_LABELS = {
  spacesSubsection: 'Spaces',
  virtualContributorsSubsection: 'Virtual Contributors',
  templatePacksSubsection: 'Template Packs',
  customHomepagesSubsection: 'Custom Homepages',
  spacesLeading: 'Lead Spaces',
  memberOf: 'All Memberships',
  emptyLeading: 'Not leading any spaces yet.',
  emptyMembership: 'No memberships yet.',
  spacePrivacy: { privacyPrivate: 'Private space', privacyPublic: 'Public space' },
};

const TABS = [
  { key: 'resourcesHosted' as ResourceTabKey, label: 'Resources Hosted' },
  { key: 'leading' as ResourceTabKey, label: 'Lead Spaces' },
  { key: 'memberOf' as ResourceTabKey, label: 'All Memberships' },
];

/**
 * Demo: Organization public profile (Alkemio Foundation).
 * Renders Verified badge, Settings (admin viewer), Message button (signed-in
 * viewer), associates grid with the 12-cap "Show more / less" toggle, and a
 * 3-tab right column mirroring the User profile (Resources Hosted / Lead
 * Spaces / All Memberships).
 */
export function OrganizationProfileDemoPage() {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>('resourcesHosted');
  const org = MOCK_ORG_ALKEMIO;

  const handleSendMessage = (text: string) =>
    new Promise<void>(resolve => {
      // eslint-disable-next-line no-console
      console.log('[demo] sendMessage to org:', text);
      setTimeout(resolve, 500);
    });

  const spacePrivacyLabels = { privacyPrivate: 'Private space', privacyPublic: 'Public space' };
  const leadSpaces = org.leadSpaces.map(s => <SpaceGridCard key={s.id} space={s} labels={spacePrivacyLabels} />);
  const memberOf = org.memberOfSpaces.map(s => <SpaceGridCard key={s.id} space={s} labels={spacePrivacyLabels} />);

  return (
    <OrganizationPublicProfileView
      hero={{
        ...org.hero,
        settingsHref: `/organization/${org.slug}/settings`,
        onSendMessage: handleSendMessage,
      }}
      sidebar={{
        bio: org.bio,
        tagsets: org.tagsets,
        references: org.references,
        associates: {
          associates: org.associates,
          totalCount: org.associatesTotal,
          canReadUsers: true,
        },
        labels: SIDEBAR_LABELS,
      }}
      tabStrip={{
        tabs: TABS,
        activeTab,
        ariaLabel: 'Organization profile resource tabs',
        onSelectTab: setActiveTab,
      }}
      rightColumn={{
        activeTab,
        hostedSpaces: org.hostedSpaces,
        hostedVirtualContributors: org.hostedVirtualContributors,
        hostedInnovationPacks: org.hostedInnovationPacks,
        hostedInnovationHubs: org.hostedInnovationHubs,
        leadSpaces,
        memberOf,
        labels: SECTIONS_LABELS,
      }}
      loading={{ hero: false, sidebar: false, hostedResources: false, memberships: false }}
      loadingLabels={{
        hero: 'Loading profile header',
        sidebar: 'Loading profile details',
        hostedResources: 'Loading hosted resources',
        memberships: 'Loading memberships',
      }}
    />
  );
}
