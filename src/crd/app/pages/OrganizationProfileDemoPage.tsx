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

const RIGHT_LABELS = {
  accountResourcesTitle: 'Account Resources',
  accountResourcesSpacesSubtitle: 'Spaces',
  accountResourcesInnovationPacksSubtitle: 'Innovation Packs',
  accountResourcesInnovationHubsSubtitle: 'Custom Homepages',
  accountResourcesShowAll: 'Show all',
  leadSpacesTitle: 'Lead Spaces',
  memberOfTitle: 'All Memberships',
  memberOfEmpty: 'No memberships yet.',
};

/**
 * Demo: Organization public profile (Alkemio Foundation).
 * Renders Verified badge, Settings (admin viewer), Message button (signed-in
 * viewer), associates grid with the 12-cap "Show more / less" toggle, and
 * Account Resources with 6-cap "Show all".
 */
export function OrganizationProfileDemoPage() {
  const org = MOCK_ORG_ALKEMIO;

  const handleSendMessage = (text: string) =>
    new Promise<void>(resolve => {
      // eslint-disable-next-line no-console
      console.log('[demo] sendMessage to org:', text);
      setTimeout(resolve, 500);
    });

  const leadSpaces = org.leadSpaces.map(s => <SpaceGridCard key={s.id} space={s} />);
  const memberOf = org.memberOfSpaces.map(s => <SpaceGridCard key={s.id} space={s} />);

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
        socialReferences: org.socialReferences,
        associates: {
          associates: org.associates,
          totalCount: org.associatesTotal,
          canReadUsers: true,
        },
        labels: SIDEBAR_LABELS,
      }}
      rightColumn={{
        accountResources: org.accountResources,
        leadSpaces,
        memberOf,
        labels: RIGHT_LABELS,
      }}
      loading={{ hero: false, sidebar: false, accountResources: false, memberships: false }}
    />
  );
}
