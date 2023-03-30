import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './JourneyPageLayoutTypes';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../platform/ui/PlatformFooter/PlatformFooter';
import { FloatingActionButtons } from '../../../../common/components/core';
import HelpButton from '../../../../common/components/core/FloatingActionButtons/HelpButton/HelpButton';
import JourneyUnauthorizedDialog from '../JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import { JourneyTypeName } from '../../JourneyTypeName';

export interface JourneyPageLayoutProps extends EntityPageLayoutProps {
  disableUnauthorizedDialog?: boolean;
}

const JourneyPageLayout = ({
  currentSection,
  children,
  pageBannerComponent: PageBanner,
  tabsComponent: Tabs,
  entityTypeName,
  disableUnauthorizedDialog = false,
}: PropsWithChildren<JourneyPageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <TopBar />
      <TopBarSpacer />
      <PageBanner />
      {!isMobile && <Tabs currentTab={currentSection} />}
      {children}
      {isMobile && <Tabs currentTab={currentSection} mobile />}
      {!isMobile && (
        <>
          <Footer />
          <FloatingActionButtons floatingActions={<HelpButton />} />
        </>
      )}
      <JourneyUnauthorizedDialogContainer journeyTypeName={entityTypeName as JourneyTypeName}>
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            journeyTypeName={entityTypeName as JourneyTypeName}
            description={vision}
            disabled={disableUnauthorizedDialog}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </>
  );
};

export default JourneyPageLayout;
