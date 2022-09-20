import { EntityPageLayout, EntityPageLayoutProps } from '../../../shared/layout/PageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import { PropsWithChildren } from 'react';

interface ChallengePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const ChallengePageLayout = (props: PropsWithChildren<ChallengePageLayoutProps>) => {
  return (
    <EntityPageLayout
      {...props}
      pageBannerComponent={ChallengePageBanner}
      tabsComponent={ChallengeTabs}
      entityTypeName="challenge"
    />
  );
};

export default ChallengePageLayout;
