import React, { PropsWithChildren } from 'react';
import { EntityPageLayout } from '../../common/EntityPageLayout';
import SubspacePageBanner from './SubspacePageBanner';
import SubspaceTabs from './SubspaceTabs';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { useSubSpace } from '../hooks/useChallenge';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface SubspacePageLayoutProps {
  currentSection: EntityPageSection;
  unauthorizedDialogDisabled?: boolean;
}

const SubspacePageLayout = ({
  unauthorizedDialogDisabled = false,
  currentSection,
  children,
}: PropsWithChildren<SubspacePageLayoutProps>) => {
  const { profile } = useSubSpace();

  const { subSpaceId: challengeId, loading } = useRouteResolver();

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBannerComponent={SubspacePageBanner}
      tabsComponent={SubspaceTabs}
    >
      {children}
      <JourneyUnauthorizedDialogContainer journeyId={challengeId} journeyTypeName="subspace" loading={loading}>
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            journeyTypeName="subspace"
            subspaceId={challengeId}
            subspaceName={profile.displayName}
            description={vision}
            disabled={unauthorizedDialogDisabled}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default SubspacePageLayout;
