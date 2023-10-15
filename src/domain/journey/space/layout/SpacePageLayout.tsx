import { EntityPageLayout } from '../../common/EntityPageLayout';
import SpacePageBanner from './SpacePageBanner';
import SpaceTabs from './SpaceTabs';
import React, { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { useSpace } from '../SpaceContext/useSpace';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';

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
  const { spaceNameId } = useSpace();

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBannerComponent={SpacePageBanner}
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
