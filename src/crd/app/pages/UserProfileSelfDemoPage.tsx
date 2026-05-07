import { useState } from 'react';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { SpaceGridCard } from '@/crd/components/user/SpaceGridCard';
import { CompactContributorCard } from '@/crd/components/common/CompactContributorCard';
import { MOCK_ME_USER } from '../data/profiles';

const SECTIONS_LABELS = {
  spacesSubsection: 'Spaces',
  virtualContributorsSubsection: 'Virtual Contributors',
  templatePacksSubsection: 'Template Packs',
  customHomepagesSubsection: 'Custom Homepages',
  spacesLeading: 'Spaces Leading',
  memberOf: 'Member of',
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
 * Demo: viewing your OWN public profile.
 * Settings icon visible, Message button hidden — matches FR-011 / FR-012.
 */
export function UserProfileSelfDemoPage() {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>('resourcesHosted');
  const me = MOCK_ME_USER;

  const organizationsSlot = me.organizations.map(org => (
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
  const spacesLeading = me.leadingSpaces.map(s => (
    <SpaceGridCard key={s.id} space={s} labels={spacePrivacyLabels} />
  ));
  const spacesMember = me.memberSpaces.map(s => <SpaceGridCard key={s.id} space={s} labels={spacePrivacyLabels} />);

  return (
    <UserPublicProfileView
      hero={{
        ...me.hero,
        showSettingsIcon: true,
        settingsHref: `/user/${me.slug}/settings/profile`,
        showMessageButton: false,
      }}
      sidebar={{
        bio: me.bio,
        tagsets: me.tagsets,
        organizationsSlot,
        organizationsEmpty: me.organizations.length === 0,
        references: me.references,
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
        hostedSpaces: me.hostedSpaces,
        hostedVirtualContributors: me.hostedVirtualContributors,
        hostedInnovationPacks: me.hostedInnovationPacks,
        hostedInnovationHubs: me.hostedInnovationHubs,
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
