import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import HubPageBanner from './HubPageBanner';
import HubTabs from './HubTabs';
import React, { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import { useHub } from '../HubContext/useHub';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';

export interface HubPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  searchDisabled?: boolean;
  unauthorizedDialogDisabled?: boolean;
}

const HubPageLayout = ({
  searchDisabled = false,
  unauthorizedDialogDisabled = false,
  ...props
}: PropsWithChildren<HubPageLayoutProps>) => {
  const { hubNameId } = useHub();

  return (
    <>
      <EntityPageLayout {...props} pageBannerComponent={HubPageBanner} tabsComponent={HubTabs} entityTypeName="hub" />
      {!searchDisabled && <SearchDialog searchRoute={`${buildHubUrl(hubNameId)}/search`} />}
      <JourneyUnauthorizedDialogContainer journeyTypeName="hub">
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            journeyTypeName="hub"
            description={vision}
            disabled={unauthorizedDialogDisabled}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </>
  );
};

export default HubPageLayout;
