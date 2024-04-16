import React, { PropsWithChildren, ReactNode, useState } from 'react';
import EntityPageLayout from '../../common/EntityPageLayout/EntityPageLayout';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import DashboardNavigation from '../../dashboardNavigation/DashboardNavigation';
import PageContent from '../../../../core/ui/content/PageContent';
import useSpaceDashboardNavigation from '../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { JourneyPath } from '../../../../main/routing/resolvers/RouteResolver';
import PageContentColumnBase from '../../../../core/ui/content/PageContentColumnBase';
import { useTranslation } from 'react-i18next';
import { KeyboardTab } from '@mui/icons-material';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import InfoColumn from './InfoColumn';

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

  const [isExpanded, setIsExpanded] = useState(false);

  const { t } = useTranslation();

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} loading={loading} />}
      pageBanner={<ChildJourneyPageBanner journeyId={journeyId} />}
    >
      <PageContent>
        <InfoColumn collapsed={isExpanded}>
          {welcome}
          <FullWidthButton
            startIcon={<KeyboardTab />}
            variant="contained"
            onClick={() => setIsExpanded(true)}
            sx={{ '.MuiSvgIcon-root': { transform: 'rotate(180deg)' } }}
          >
            {t('buttons.collapse')}
          </FullWidthButton>
          <DashboardNavigation
            currentItemId={journeyId}
            spaceUrl={spaceProfile.url}
            displayName={spaceProfile.displayName}
            dashboardNavigation={dashboardNavigation}
          />
        </InfoColumn>
        <PageContentColumnBase columns={isExpanded ? 12 : 9} flexBasis={0} flexGrow={1} flexShrink={1} minWidth={0}>
          {children}
        </PageContentColumnBase>
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
