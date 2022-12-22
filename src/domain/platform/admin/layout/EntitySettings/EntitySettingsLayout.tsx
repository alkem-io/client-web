import React, { ComponentType, FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../../common/components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { EntityTabsProps } from '../../../../challenge/common/EntityPageLayout';
import SimplePageLayout from '../../../../shared/layout/LegacyPageLayout/SimplePageLayout';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../../../core/ui/layout/Footer/Footer';
import { FloatingActionButtons } from '../../../../../common/components/core';
import {
  GRID_COLUMNS_DESKTOP,
  GRID_COLUMNS_MOBILE,
  MAX_CONTENT_WIDTH_WITH_GUTTER,
} from '../../../../../core/ui/grid/constants';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import useCurrentBreakpoint from '../../../../../core/ui/utils/useCurrentBreakpoint';

type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization' | 'user';

type EntitySettingsLayoutProps = {
  pageBannerComponent: ComponentType;
  tabsComponent: ComponentType<EntityTabsProps>;
  entityTypeName: EntityTypeName;
  tabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
  addColumn?: boolean;
};

// TODO Put LayoutHolder into Admin routes, making EntitySettingsLayout able to render EntityPageLayout.
// Breakpoint checks and choosing the layout variation will be then handled by EntityPageLayout, thus making
// EntitySettingsLayout a thin wrapper around EntityPageLayout that just prepends PageTabs to `children`.
const EntitySettingsLayout: FC<EntitySettingsLayoutProps> = ({
  entityTypeName,
  tabs,
  currentTab,
  tabRoutePrefix = '../',
  children,
  pageBannerComponent: PageBanner,
  tabsComponent: Tabs,
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);

  // TODO use EntityPageLayout inside EntitySettingsLayout
  const theme = useTheme();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const paddingBottom = isMobile ? 6 : 0;

  return (
    <>
      <TopBar />
      <TopBarSpacer />
      <PageBanner />
      {!isMobile && <Tabs currentTab={EntityPageSection.Settings} />}
      <Box>
        <Box maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER} marginX="auto">
          <PageTabs
            tabs={tabs}
            currentTab={currentTab}
            aria-label={`${entityTypeName} Settings tabs`}
            routePrefix={tabRoutePrefix}
            getTabLabel={getTabLabel}
          />
        </Box>
      </Box>
      <Box flexGrow={1} sx={{ backgroundColor: 'background.paper', paddingBottom }}>
        <Box maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER} marginX="auto">
          <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
            <SimplePageLayout
              currentSection={currentTab}
              entityTypeName={entityTypeName}
              tabDescriptionNs="pages.admin"
            >
              {children}
            </SimplePageLayout>
          </GridProvider>
        </Box>
      </Box>
      {isMobile && <Tabs currentTab={EntityPageSection.Settings} mobile />}
      {!isMobile && (
        <>
          <Footer />
          <FloatingActionButtons />
        </>
      )}
    </>
  );
};

export default EntitySettingsLayout;
