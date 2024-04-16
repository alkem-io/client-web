import React, { PropsWithChildren, ReactNode, useState } from 'react';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import DashboardNavigation from '../../dashboardNavigation/DashboardNavigation';
import PageContent from '../../../../core/ui/content/PageContent';
import useSpaceDashboardNavigation from '../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { JourneyPath } from '../../../../main/routing/resolvers/RouteResolver';
import PageContentColumnBase from '../../../../core/ui/content/PageContentColumnBase';
import { useTranslation } from 'react-i18next';
import { KeyboardTab, Menu } from '@mui/icons-material';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import InfoColumn from './InfoColumn';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import FloatingActionButtons from '../../../../core/ui/button/FloatingActionButtons';
import { gutters } from '../../../../core/ui/grid/utils';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';
import { NotFoundErrorBoundary } from '../../../../core/notFound/NotFoundErrorBoundary';
import { Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { GRID_COLUMNS_MOBILE } from '../../../../core/ui/grid/constants';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

export interface SubspacePageLayoutProps {
  journeyId: string | undefined;
  journeyPath: JourneyPath;
  loading?: boolean;
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

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(true);

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <TopLevelLayout>
          <Error404 />
        </TopLevelLayout>
      }
    >
      <TopLevelLayout
        breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} loading={loading} />}
        header={<ChildJourneyPageBanner journeyId={journeyId} />}
        floatingActions={
          <FloatingActionButtons
            {...(isMobile ? { bottom: gutters(3) } : {})}
            visible
            floatingActions={<PlatformHelpButton />}
          />
        }
        addWatermark={isMobile}
      >
        <PageContent>
          <InfoColumn collapsed={isExpanded}>
            <PageContentBlock accent>{welcome}</PageContentBlock>
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
      </TopLevelLayout>
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
      {isMobile && (
        <SwapColors>
          <GridProvider columns={GRID_COLUMNS_MOBILE}>
            <Drawer
              open={isInfoDrawerOpen}
              onClose={() => setIsInfoDrawerOpen(false)}
              sx={{ '.MuiDrawer-paper': { width: '60vw' } }}
            >
              <PageContentBlockSeamless>{welcome}</PageContentBlockSeamless>
            </Drawer>
          </GridProvider>
        </SwapColors>
      )}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, paddingBottom: gutters() }} elevation={3} square>
          <IconButton onClick={() => setIsInfoDrawerOpen(true)}>
            <Menu />
          </IconButton>
        </Paper>
      )}
    </NotFoundErrorBoundary>
  );
};

export default SubspacePageLayout;
