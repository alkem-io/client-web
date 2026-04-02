import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { Identifiable } from '@/core/utils/Identifiable';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import type { Visual } from '@/domain/common/visual/Visual';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { mapSpacesToCardDataList } from './spaceCardDataMapper';
import useSpaceExplorer from './useSpaceExplorer';

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

const SpaceExplorerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle(t('pages.titles.spaces'));

  const {
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
  } = useSpaceExplorer();

  const cardData = mapSpacesToCardDataList(spaces, authenticated);

  return (
    <SpaceExplorer
      spaces={cardData}
      loading={loading}
      hasMore={hasMore}
      searchTerms={searchTerms}
      membershipFilter={membershipFilter}
      authenticated={authenticated}
      loadingSearchResults={loadingSearchResults}
      onSearchTermsChange={terms => setSearchTerms(terms)}
      onMembershipFilterChange={onMembershipFilterChange}
      onLoadMore={fetchMore}
      onParentClick={parent => navigate(parent.href)}
    />
  );
};

export default SpaceExplorerPage;
