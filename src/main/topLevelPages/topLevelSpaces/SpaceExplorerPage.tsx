import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import useInnovationHubOutsideRibbon from '@/domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import TopLevelPageBreadcrumbs from '../topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import SpaceExplorerContainer from './SpaceExplorerContainer';
import { SpaceExplorerView } from './SpaceExplorerView';

const SpaceExplorerPage = () => {
  const { t } = useTranslation();

  // Set browser tab title to "Spaces | Alkemio"
  usePageTitle(t('pages.titles.spaces'));

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.subspaces' });

  return (
    <TopLevelPageLayout
      iconComponent={SpaceL0Icon}
      title={t('pages.exploreSpaces.fullName')}
      subtitle={t('pages.exploreSpaces.subtitle')}
      ribbon={ribbon}
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem iconComponent={SpaceL0Icon}>{t('pages.exploreSpaces.shortName')}</BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
    >
      <SpaceExplorerContainer>
        {provided => {
          return <SpaceExplorerView {...provided} />;
        }}
      </SpaceExplorerContainer>
    </TopLevelPageLayout>
  );
};

export default SpaceExplorerPage;
