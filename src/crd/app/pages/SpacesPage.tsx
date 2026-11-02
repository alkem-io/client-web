import { useState } from 'react';
import type { SpacePrivacyFilter, SpacesFilterValue, SpaceTypeFilter } from '@/crd/components/space/SpaceExplorer';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { MOCK_SPACES } from '../data/spaces';

const BATCH_SIZE = 12;

export function SpacesPage() {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [membershipFilter, setMembershipFilter] = useState<SpacesFilterValue>('all');
  // Same default as the app: "Spaces only" while browsing, "All" while searching, unless the visitor picks a Type.
  const [chosenTypeFilter, setChosenTypeFilter] = useState<SpaceTypeFilter>();
  const typeFilter = chosenTypeFilter ?? (searchTerms.length > 0 ? 'all' : 'spaces');
  const [privacyFilter, setPrivacyFilter] = useState<SpacePrivacyFilter>('all');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  let filteredSpaces = [...MOCK_SPACES];
  if (searchTerms.length > 0) {
    filteredSpaces = filteredSpaces.filter(space => {
      const text = `${space.name} ${space.description} ${space.tags.join(' ')}`.toLowerCase();
      return searchTerms.every(term => text.includes(term));
    });
  }

  if (typeFilter === 'spaces') filteredSpaces = filteredSpaces.filter(space => !space.parent);
  if (typeFilter === 'subspaces') filteredSpaces = filteredSpaces.filter(space => !!space.parent);
  if (privacyFilter === 'public') filteredSpaces = filteredSpaces.filter(space => !space.isPrivate);
  if (privacyFilter === 'private') filteredSpaces = filteredSpaces.filter(space => space.isPrivate);

  const displayedSpaces = filteredSpaces.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSpaces.length;

  const handleLoadMore = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setVisibleCount(prev => prev + BATCH_SIZE);
  };

  return (
    <SpaceExplorer
      spaces={displayedSpaces}
      loading={false}
      hasMore={hasMore}
      searchTerms={searchTerms}
      membershipFilter={membershipFilter}
      authenticated={true}
      onSearchTermsChange={terms => {
        setSearchTerms(terms);
        setVisibleCount(BATCH_SIZE);
      }}
      onMembershipFilterChange={setMembershipFilter}
      typeFilter={typeFilter}
      onTypeFilterChange={filter => {
        setChosenTypeFilter(filter);
        setVisibleCount(BATCH_SIZE);
      }}
      privacyFilter={privacyFilter}
      onPrivacyFilterChange={filter => {
        setPrivacyFilter(filter);
        setVisibleCount(BATCH_SIZE);
      }}
      onLoadMore={handleLoadMore}
      onParentClick={parent => {
        window.location.href = parent.href;
      }}
    />
  );
}
