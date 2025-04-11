import { useTranslation } from 'react-i18next';
import SpaceExplorerContainer from './SpaceExplorerContainer';
import { SpaceExplorerView } from './SpaceExplorerView';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import useInnovationHubOutsideRibbon from '@/domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import TopLevelPageBreadcrumbs from '../topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';

const SpaceExplorerPage = () => {
  const { t } = useTranslation();

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
