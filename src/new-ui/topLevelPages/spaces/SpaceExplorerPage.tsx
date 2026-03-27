import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { SpacesFilterValue } from '@/crd/components/space/SpaceExplorer';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import type { Visual } from '@/domain/common/visual/Visual';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { mapSpacesToCardDataList } from './spaceCardDataMapper';

export enum SpacesExplorerMembershipFilter {
  All = 'all',
  Member = 'member',
  Public = 'public',
}

export type SpaceWithParent = Space & WithParent<ParentSpace>;

interface ParentSpace extends Identifiable {
  level: SpaceLevel;
  about: {
    profile: {
      displayName: string;
      avatar?: Visual;
      cardBanner?: Visual;
      url: string;
    };
  };
}

type WithParent<ParentInfo extends {}> = {
  parent?: ParentInfo & WithParent<ParentInfo>;
};

interface Space extends Identifiable {
  level: SpaceLevel;
  about: SpaceAboutLightModel;
  matchedTerms?: string[];
}

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

export interface SpaceExplorerViewProps {
  spaces: SpaceWithParent[] | undefined;
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
  membershipFilter: SpacesExplorerMembershipFilter;
  searchTerms: string[];
  onMembershipFilterChange?: (filter: SpacesExplorerMembershipFilter) => void;
  loading: boolean;
  hasMore: boolean | undefined;
  fetchMore: () => Promise<void>;
  authenticated: boolean;
  loadingSearchResults?: boolean | null;
}

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
