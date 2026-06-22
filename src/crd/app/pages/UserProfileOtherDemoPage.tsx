import { useState } from 'react';
import { CompactContributorCard } from '@/crd/components/common/CompactContributorCard';
import { SpaceGridCard } from '@/crd/components/user/SpaceGridCard';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import { MOCK_ALEX_RIVERA } from '../data/profiles';

const SECTIONS_LABELS = {
  spacesSubsection: 'Spaces',
  virtualContributorsSubsection: 'Virtual Contributors',
  templatePacksSubsection: 'Template Packs',
  customHomepagesSubsection: 'Custom Homepages',
  spacesLeading: 'Spaces Leading',
  memberOf: 'Member of',
  emptyResourcesHosted: 'No resources hosted yet.',
  emptyLeading: 'Not leading any spaces yet.',
  emptyMembership: 'No memberships yet.',
  spacePrivacy: { privacyPrivate: 'Private space', privacyPublic: 'Public space' },
};

const SIDEBAR_LABELS = {
  aboutTitle: 'About',
  organizationsTitle: 'Organizations',
  socialLinksTitle: 'Social',
  bioEmpty: 'No bio yet.',
  organizationsEmpty: 'Not part of any organization yet.',
};

const TABS = [
  { key: 'resourcesHosted' as ResourceTabKey, label: 'Resources Hosted' },
  { key: 'leading' as ResourceTabKey, label: 'Leading' },
  { key: 'memberOf' as ResourceTabKey, label: 'Member Of' },
];

/**
 * Demo: viewing ANOTHER user's public profile (Alex Rivera from the prototype).
 * Settings icon hidden (non-admin viewer), Message button visible.
 *
 * Press the "Message" trigger to open the in-hero compose Popover. The mock
 * `onSendMessage` resolves after a short delay so designers can see the
 * `aria-busy` / spinner state.
 */
export function UserProfileOtherDemoPage() {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>('resourcesHosted');
  const alex = MOCK_ALEX_RIVERA;

  const handleSendMessage = (text: string) =>
    new Promise<void>(resolve => {
      // eslint-disable-next-line no-console
      console.log('[demo] sendMessage to Alex:', text);
      setTimeout(resolve, 500);
    });

  const organizationsSlot = alex.organizations.map(org => (
    <CompactContributorCard
      key={org.id}
      id={org.id}
      displayName={org.displayName}
      avatarImageUrl={org.avatarImageUrl}
      caption={org.caption}
      secondaryCaption={org.secondaryCaption}
      href={org.href}
      badge={{ label: String(org.memberCount), icon: 'users' }}
    />
  ));

  const spacePrivacyLabels = { privacyPrivate: 'Private space', privacyPublic: 'Public space' };
  const spacesLeading = alex.leadingSpaces.map(s => (
    <SpaceGridCard key={s.id} space={s} labels={spacePrivacyLabels} />
  ));
  const spacesMember = alex.memberSpaces.map(s => (
    <SpaceGridCard key={s.id} space={s} labels={spacePrivacyLabels} />
  ));

  return (
    <UserPublicProfileView
      hero={{
        ...alex.hero,
        showSettingsIcon: false,
        onMessageClick: () => handleSendMessage('open chat'),
        onSendEmail: handleSendMessage,
      }}
      sidebar={{
        bio: alex.bio,
        tagsets: alex.tagsets,
        organizationsSlot,
        organizationsEmpty: alex.organizations.length === 0,
        labels: SIDEBAR_LABELS,
      }}
      tabStrip={{
        tabs: TABS,
        activeTab,
        onSelectTab: setActiveTab,
        ariaLabel: 'User profile resource tabs',
      }}
      sections={{
        activeTab,
        hostedSpaces: alex.hostedSpaces,
        hostedVirtualContributors: alex.hostedVirtualContributors,
        hostedInnovationPacks: alex.hostedInnovationPacks,
        hostedInnovationHubs: alex.hostedInnovationHubs,
        spacesLeading,
        spacesMember,
        labels: SECTIONS_LABELS,
      }}
      loading={{ hero: false, organizations: false, hostedResources: false, memberships: false }}
      loadingLabels={{
        hero: 'Loading profile header',
        organizations: 'Loading organizations',
        hostedResources: 'Loading hosted resources',
        memberships: 'Loading memberships',
      }}
    />
  );
}
