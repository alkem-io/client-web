import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import React, { PropsWithChildren } from 'react';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';

export interface ChallengePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  unauthorizedDialogDisabled?: boolean;
}

const ChallengePageLayout = ({
  unauthorizedDialogDisabled = false,
  ...props
}: PropsWithChildren<ChallengePageLayoutProps>) => {
  return (
    <>
      <EntityPageLayout
        {...props}
        pageBannerComponent={ChallengePageBanner}
        tabsComponent={ChallengeTabs}
        entityTypeName="challenge"
      />
      <JourneyUnauthorizedDialogContainer journeyTypeName="challenge">
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            journeyTypeName="challenge"
            description={vision}
            disabled={unauthorizedDialogDisabled}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </>
  );
};

export default ChallengePageLayout;
