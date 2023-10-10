import React, { PropsWithChildren } from 'react';
import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { useChallenge } from '../hooks/useChallenge';

export interface ChallengePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  unauthorizedDialogDisabled?: boolean;
}

const ChallengePageLayout = ({
  unauthorizedDialogDisabled = false,
  children,
  ...props
}: PropsWithChildren<ChallengePageLayoutProps>) => {
  const { challengeId, challengeNameId, profile } = useChallenge();

  return (
    <EntityPageLayout
      {...props}
      pageBannerComponent={ChallengePageBanner}
      tabsComponent={ChallengeTabs}
      entityTypeName="challenge"
    >
      {children}
      <JourneyUnauthorizedDialogContainer journeyTypeName="challenge">
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            journeyTypeName="challenge"
            challengeId={challengeId}
            challengeNameId={challengeNameId}
            challengeName={profile.displayName}
            description={vision}
            disabled={unauthorizedDialogDisabled}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default ChallengePageLayout;
