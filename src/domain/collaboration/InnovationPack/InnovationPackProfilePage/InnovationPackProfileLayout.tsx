import React, { PropsWithChildren } from 'react';
import { EntityPageLayout, EntityPageLayoutProps } from '../../../challenge/common/EntityPageLayout';
import InnovationPageTabs from './InnovationPageTabs';
import InnovationPackBanner from './InnovationPackBanner';

interface InnovationPackProfileLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  displayName: string;
}

const InnovationPackProfileLayout = ({
  displayName,
  ...props
}: PropsWithChildren<InnovationPackProfileLayoutProps>) => {
  return (
    <EntityPageLayout
      {...props}
      pageBanner={<InnovationPackBanner displayName={displayName} />}
      tabsComponent={InnovationPageTabs}
      entityTypeName="innovationPack"
    />
  );
};

export default InnovationPackProfileLayout;
