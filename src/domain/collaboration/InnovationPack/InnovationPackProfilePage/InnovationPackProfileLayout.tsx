import React, { ComponentType, PropsWithChildren } from 'react';
import { EntityPageLayout, EntityPageLayoutProps } from '../../../journey/common/EntityPageLayout';
import InnovationPageTabs, { InnovationPageTabsProps } from './InnovationPageTabs';
import InnovationPackBanner, { InnovationPackBannerProps } from './InnovationPackBanner';

interface InnovationPackProfileLayoutProps
  extends InnovationPackBannerProps,
    Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  showSettings: boolean;
}

const InnovationPackProfileLayout = ({
  displayName,
  tagline,
  providerDisplayName,
  providerUri,
  providerVisualUri,
  showSettings,
  ...props
}: PropsWithChildren<InnovationPackProfileLayoutProps>) => {
  const Tabs = InnovationPageTabs as ComponentType<Partial<InnovationPageTabsProps>>;

  return (
    <EntityPageLayout
      {...props}
      pageBanner={
        <InnovationPackBanner
          displayName={displayName}
          tagline={tagline}
          providerDisplayName={providerDisplayName}
          providerUri={providerUri}
          providerVisualUri={providerVisualUri}
        />
      }
      tabs={<Tabs showSettings={showSettings} />}
    />
  );
};

export default InnovationPackProfileLayout;
