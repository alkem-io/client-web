import { JourneyPageLayout, EntityPageLayoutProps } from '../../common/JourneyPageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import { PropsWithChildren } from 'react';

export interface ChallengePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const ChallengePageLayout = (props: PropsWithChildren<ChallengePageLayoutProps>) => {
  return (
    <JourneyPageLayout
      {...props}
      pageBannerComponent={ChallengePageBanner}
      tabsComponent={ChallengeTabs}
      entityTypeName="challenge"
    />
  );
};

export default ChallengePageLayout;
