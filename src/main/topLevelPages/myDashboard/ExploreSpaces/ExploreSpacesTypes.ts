import { Visual } from '@/domain/common/visual/Visual';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceLevel, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';

export interface ExploreSpacesContainerEntities {
  spaces: SpaceWithParent[] | undefined;
  searchTerms: string[];
  selectedFilter: string;
  fetchMore: () => Promise<void>;
  loading: boolean;
  hasMore: boolean | undefined;
  filtersConfig: {
    key: string;
    name: string;
    tags: string[];
  }[];
}

export interface ExploreSpacesContainerProps extends SimpleContainerProps<ExploreSpacesContainerEntities> {
  searchTerms: string[];
  selectedFilter: string;
}

export type SpaceWithParent = Space & WithParent<ParentSpace>;

interface ParentSpace extends Identifiable {
  profile: {
    displayName: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
  settings: {
    privacy?: {
      mode: SpacePrivacyMode;
    };
  };
}

type WithParent<ParentInfo extends {}> = {
  parent?: ParentInfo & WithParent<ParentInfo>;
};

interface Space extends Identifiable {
  profile: {
    url: string;
    displayName: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
  level: SpaceLevel;
}

export interface ExploreSpacesViewProps {
  spaces: SpaceWithParent[] | undefined;
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedFilter: string;
  searchTerms: string[];
  loading: boolean;
  hasMore: boolean | undefined;
  fetchMore: () => Promise<void>;
  filtersConfig: {
    key: string;
    name: string;
  }[];
  welcomeSpace?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      cardBanner?: Visual;
    };
    level: SpaceLevel.L0;
  };
  itemsPerRow?: number;
  itemsLimit?: number;
}
