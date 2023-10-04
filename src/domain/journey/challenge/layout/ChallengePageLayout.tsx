import React, { PropsWithChildren } from 'react';
import { EntityPageLayout, EntityPageLayoutProps, NotFoundPageLayout } from '../../common/EntityPageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { useChallenge } from '../hooks/useChallenge';
import { NotFoundErrorBoundary } from '../../../../core/notfound/NotFoundErrorBoundary';
import { Error404 } from '../../../../core/pages/Errors/Error404';

export interface ChallengePageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {
  unauthorizedDialogDisabled?: boolean;
}

const ChallengePageLayout = ({
  unauthorizedDialogDisabled = false,
  ...props
}: PropsWithChildren<ChallengePageLayoutProps>) => {
  const { challengeId, challengeNameId, profile } = useChallenge();

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <NotFoundPageLayout>
          <Error404 />
        </NotFoundPageLayout>
      }
    >
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
            challengeId={challengeId}
            challengeNameId={challengeNameId}
            challengeName={profile.displayName}
            description={vision}
            disabled={unauthorizedDialogDisabled}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </NotFoundErrorBoundary>
  );
};

export default ChallengePageLayout;
