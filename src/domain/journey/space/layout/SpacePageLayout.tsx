import { EntityPageLayout } from '../../common/EntityPageLayout';
import SpaceTabs from './SpaceTabs';
import React, { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { useSpace } from '../SpaceContext/useSpace';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from './SpacePageBanner';

export interface SpacePageLayoutProps {
  currentSection: EntityPageSection;
  searchDisabled?: boolean;
  unauthorizedDialogDisabled?: boolean;
}

const SpacePageLayout = ({
  searchDisabled = false,
  unauthorizedDialogDisabled = false,
  currentSection,
  children,
}: PropsWithChildren<SpacePageLayoutProps>) => {
  const { spaceNameId, spaceId, profile, loading } = useSpace();

  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBanner={
        <SpacePageBanner
          title={profile.displayName}
          tagline={profile?.tagline}
          loading={loading}
          bannerUrl={visual?.uri}
          bannerAltText={visual?.alternativeText}
          ribbon={ribbon}
          journeyTypeName="space"
        />
      }
      tabsComponent={SpaceTabs}
    >
      {children}
      {!searchDisabled && <SearchDialog searchRoute={`${buildSpaceUrl(spaceNameId)}/search`} />}
      <JourneyUnauthorizedDialogContainer journeyTypeName="space">
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            journeyTypeName="space"
            description={vision}
            disabled={unauthorizedDialogDisabled}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default SpacePageLayout;
