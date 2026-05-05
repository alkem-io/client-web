import { useState } from 'react';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import type { ResourceTabKey } from '@/crd/components/user/UserResourceTabStrip';
import { SpaceGridCard } from '@/crd/components/user/SpaceGridCard';
import { CompactContributorCard } from '@/crd/components/common/CompactContributorCard';
import { MOCK_ME_USER } from '../data/profiles';

const SECTIONS_LABELS = {
  resourcesHosted: 'Resources Hosted',
  spacesSubsection: 'Spaces',
  virtualContributorsSubsection: 'Virtual Contributors',
  spacesLeading: 'Spaces Leading',
  memberOf: 'Member of',
  totalBadge: (count: number) => `${count} Total`,
  emptyLeading: 'Not leading any spaces yet.',
  emptyMembership: 'No memberships yet.',
};

const SIDEBAR_LABELS = {
  aboutTitle: 'About',
  organizationsTitle: 'Organizations',
  emptyBio: 'No bio yet.',
  emptyOrganizations: 'Not part of any organization yet.',
};

const TABS = [
  { key: 'allResources' as ResourceTabKey, label: 'All Resources' },
  { key: 'hostedSpaces' as ResourceTabKey, label: 'Hosted Spaces' },
  { key: 'virtualContributors' as ResourceTabKey, label: 'Virtual Contributors' },
  { key: 'leading' as ResourceTabKey, label: 'Leading' },
  { key: 'memberOf' as ResourceTabKey, label: 'Member Of' },
];

/**
 * Demo: viewing your OWN public profile.
 * Settings icon visible, Message button hidden — matches FR-011 / FR-012.
 */
export function UserProfileSelfDemoPage() {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>('allResources');
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

  const spacesLeading = me.leadingSpaces.map(s => <SpaceGridCard key={s.id} space={s} />);
  const spacesMember = me.memberSpaces.map(s => <SpaceGridCard key={s.id} space={s} />);

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
        organizationsSlot,
        organizationsEmpty: me.organizations.length === 0,
        labels: SIDEBAR_LABELS,
      }}
      tabStrip={{
        tabs: TABS,
        activeTab,
        onSelectTab: setActiveTab,
      }}
      sections={{
        activeTab,
        hostedSpaces: me.hostedSpaces,
        hostedVirtualContributors: me.hostedVirtualContributors,
        spacesLeading,
        spacesMember,
        labels: SECTIONS_LABELS,
      }}
      loading={{ hero: false, organizations: false, hostedResources: false, memberships: false }}
    />
  );
}
