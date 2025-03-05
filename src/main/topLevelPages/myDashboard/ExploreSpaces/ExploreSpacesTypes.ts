import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Identifiable } from '@/core/utils/Identifiable';
import { SpaceLevel, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

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
  about: SpaceAboutLightModel;
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
  about: SpaceAboutLightModel;
  level?: SpaceLevel;
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
    about: SpaceAboutLightModel;
    level: SpaceLevel.L0;
  };
  itemsPerRow?: number;
  itemsLimit?: number;
}
