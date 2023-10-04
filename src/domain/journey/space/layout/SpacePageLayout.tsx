import { EntityPageLayout, EntityPageLayoutProps, NotFoundPageLayout } from '../../common/EntityPageLayout';
import SpacePageBanner from './SpacePageBanner';
import SpaceTabs from './SpaceTabs';
import React, { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { useSpace } from '../SpaceContext/useSpace';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { NotFoundErrorBoundary } from '../../../../core/notfound/NotFoundErrorBoundary';
import { Error404 } from '../../../../core/pages/Errors/Error404';

export interface SpacePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  searchDisabled?: boolean;
  unauthorizedDialogDisabled?: boolean;
}

const SpacePageLayout = ({
  searchDisabled = false,
  unauthorizedDialogDisabled = false,
  ...props
}: PropsWithChildren<SpacePageLayoutProps>) => {
  const { spaceNameId } = useSpace();

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <NotFoundPageLayout>
          <Error404 />
        </NotFoundPageLayout>
      }
    >
      <EntityPageLayout
        {...props}
        pageBannerComponent={SpacePageBanner}
        tabsComponent={SpaceTabs}
        entityTypeName="space"
      />
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
    </NotFoundErrorBoundary>
  );
};

export default SpacePageLayout;
