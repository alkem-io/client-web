import React, { PropsWithChildren, ReactNode } from 'react';
import EntityPageLayout from '../../common/EntityPageLayout/EntityPageLayout';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import DashboardNavigation from '../../dashboardNavigation/DashboardNavigation';
import InfoColumn from '../../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../../core/ui/content/ContentColumn';
import PageContent from '../../../../core/ui/content/PageContent';
import useSpaceDashboardNavigation from '../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { JourneyPath } from '../../../../main/routing/resolvers/RouteResolver';

export interface SubspacePageLayoutProps {
  journeyId: string | undefined;
  journeyPath: JourneyPath;
  loading?: boolean;
  currentSection: EntityPageSection;
  unauthorizedDialogDisabled?: boolean;
  welcome?: ReactNode;
  profile?: {
    // TODO make required
    displayName: string;
  };
}

const SubspacePageLayout = ({
  journeyId,
  journeyPath,
  loading = false,
  unauthorizedDialogDisabled = false,
  currentSection,
  welcome,
  profile,
  children,
}: PropsWithChildren<SubspacePageLayoutProps>) => {
  const { spaceId, profile: spaceProfile } = useSpace();

  const { dashboardNavigation } = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} loading={loading} />}
      pageBanner={<ChildJourneyPageBanner journeyId={journeyId} />}
    >
      <PageContent>
        <InfoColumn>
          {welcome}
          <DashboardNavigation
            currentItemId={journeyId}
            spaceUrl={spaceProfile.url}
            displayName={spaceProfile.displayName}
            dashboardNavigation={dashboardNavigation}
          />
        </InfoColumn>
        <ContentColumn>{children}</ContentColumn>
      </PageContent>
      <JourneyUnauthorizedDialogContainer journeyId={journeyId} loading={loading}>
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            subspaceId={journeyId}
            subspaceName={profile?.displayName}
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
