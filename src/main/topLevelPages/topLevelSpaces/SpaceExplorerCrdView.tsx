import type { SpacesFilterValue } from '@/crd/components/space/SpaceExplorer';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { type SpaceExplorerViewProps, SpacesExplorerMembershipFilter } from './SpaceExplorerView';
import { mapSpacesToCardDataList } from './spaceCardDataMapper';

const mapFilter = (filter: SpacesExplorerMembershipFilter): SpacesFilterValue => {
  switch (filter) {
    case SpacesExplorerMembershipFilter.All:
      return 'all';
    case SpacesExplorerMembershipFilter.Member:
      return 'member';
    case SpacesExplorerMembershipFilter.Public:
      return 'public';
    default:
      return 'all';
  }
};

const mapFilterBack = (filter: SpacesFilterValue): SpacesExplorerMembershipFilter => {
  switch (filter) {
    case 'all':
      return SpacesExplorerMembershipFilter.All;
    case 'member':
      return SpacesExplorerMembershipFilter.Member;
    case 'public':
      return SpacesExplorerMembershipFilter.Public;
    default:
      return SpacesExplorerMembershipFilter.All;
  }
};

export const SpaceExplorerCrdView = ({
  spaces,
  loading,
  searchTerms,
  setSearchTerms,
  membershipFilter,
  onMembershipFilterChange,
  fetchMore,
  hasMore,
  authenticated,
  loadingSearchResults,
}: SpaceExplorerViewProps) => {
  const cardData = mapSpacesToCardDataList(spaces, authenticated);

  return (
    <SpaceExplorer
      spaces={cardData}
      loading={loading}
      hasMore={hasMore}
      searchTerms={searchTerms}
      membershipFilter={mapFilter(membershipFilter)}
      authenticated={authenticated}
      loadingSearchResults={loadingSearchResults ?? undefined}
      onSearchTermsChange={terms => setSearchTerms(terms)}
      onMembershipFilterChange={
        onMembershipFilterChange ? filter => onMembershipFilterChange(mapFilterBack(filter)) : undefined
      }
      onLoadMore={fetchMore}
    />
  );
};
