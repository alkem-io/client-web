import { JourneyPageLayout } from '../../common/JourneyPageLayout';
import HubPageBanner from './HubPageBanner';
import HubTabs from './HubTabs';
import { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import { useHub } from '../HubContext/useHub';
import { JourneyPageLayoutProps } from '../../common/JourneyPageLayout/JourneyPageLayout';

export interface HubPageLayoutProps
  extends Omit<JourneyPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  searchDisabled?: boolean;
}

const HubPageLayout = ({ searchDisabled = false, ...props }: PropsWithChildren<HubPageLayoutProps>) => {
  const { hubNameId } = useHub();

  return (
    <>
      <JourneyPageLayout {...props} pageBannerComponent={HubPageBanner} tabsComponent={HubTabs} entityTypeName="hub" />
      {!searchDisabled && <SearchDialog searchRoute={`${buildHubUrl(hubNameId)}/search`} />}
    </>
  );
};

export default HubPageLayout;
