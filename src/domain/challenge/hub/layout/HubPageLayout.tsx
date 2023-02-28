import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import HubPageBanner from './HubPageBanner';
import HubTabs from './HubTabs';
import { PropsWithChildren } from 'react';
import SearchDialog from '../../../platform/search/SearchDialog';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import { useHub } from '../HubContext/useHub';

export interface HubPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  searchDisabled?: boolean;
}

const HubPageLayout = ({ searchDisabled = false, ...props }: PropsWithChildren<HubPageLayoutProps>) => {
  const { hubNameId } = useHub();

  return (
    <>
      <EntityPageLayout {...props} pageBannerComponent={HubPageBanner} tabsComponent={HubTabs} entityTypeName="hub" />
      {!searchDisabled && <SearchDialog searchRoute={`${buildHubUrl(hubNameId)}/search`} />}
    </>
  );
};

export default HubPageLayout;
