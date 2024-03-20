import React, { PropsWithChildren } from 'react';
import { EntityPageLayout } from '../../common/EntityPageLayout';
import ChallengePageBanner from './ChallengePageBanner';
import ChallengeTabs from './ChallengeTabs';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { useChallenge } from '../hooks/useChallenge';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface ChallengePageLayoutProps {
  currentSection: EntityPageSection;
  unauthorizedDialogDisabled?: boolean;
}

const ChallengePageLayout = ({
  unauthorizedDialogDisabled = false,
  currentSection,
  children,
}: PropsWithChildren<ChallengePageLayoutProps>) => {
  const { profile } = useChallenge();

  const { challengeNameId } = useUrlParams();

  const { challengeId, loading } = useRouteResolver();

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBannerComponent={ChallengePageBanner}
      tabsComponent={ChallengeTabs}
    >
      {children}
      <JourneyUnauthorizedDialogContainer journeyId={challengeId} journeyTypeName="challenge" loading={loading}>
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
