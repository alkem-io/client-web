import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import { PropsWithChildren } from 'react';

export interface ChallengePageLayoutProps
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
