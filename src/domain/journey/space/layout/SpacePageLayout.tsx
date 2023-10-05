import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import SpacePageBanner from './SpacePageBanner';
import SpaceTabs from './SpaceTabs';
import React, { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { useSpace } from '../SpaceContext/useSpace';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';

export interface SpacePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  searchDisabled?: boolean;
  unauthorizedDialogDisabled?: boolean;
}

const SpacePageLayout = ({
  searchDisabled = false,
  unauthorizedDialogDisabled = false,
  children,
  ...props
}: PropsWithChildren<SpacePageLayoutProps>) => {
  const { spaceNameId } = useSpace();

  return (
    <EntityPageLayout {...props} pageBannerComponent={SpacePageBanner} tabsComponent={SpaceTabs} entityTypeName="space">
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
