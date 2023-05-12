import React, { PropsWithChildren } from 'react';
import { EntityPageLayout, EntityPageLayoutProps } from '../../../challenge/common/EntityPageLayout';
import InnovationPageTabs from './InnovationPageTabs';
import InnovationPackBanner, { InnovationPackBannerProps } from './InnovationPackBanner';

interface InnovationPackProfileLayoutProps
  extends InnovationPackBannerProps,
    Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const InnovationPackProfileLayout = ({
  displayName,
  tagline,
  providerDisplayName,
  providerUri,
  ...props
}: PropsWithChildren<InnovationPackProfileLayoutProps>) => {
  return (
    <EntityPageLayout
      {...props}
      pageBanner={
        <InnovationPackBanner
          displayName={displayName}
          tagline={tagline}
          providerDisplayName={providerDisplayName}
          providerUri={providerUri}
        />
      }
      tabsComponent={InnovationPageTabs}
      entityTypeName="innovationPack"
    />
  );
};

export default InnovationPackProfileLayout;
