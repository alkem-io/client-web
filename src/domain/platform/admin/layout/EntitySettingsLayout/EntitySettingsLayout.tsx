import React, { ComponentType, FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import EntitySettingsTabs, { TabDefinition } from './EntitySettingsTabs';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { EntityTabsProps } from '../../../../journey/common/EntityPageLayout';
import SettingsPageContent from './SettingsPageContent';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import {
  GRID_COLUMNS_DESKTOP,
  GRID_COLUMNS_MOBILE,
  MAX_CONTENT_WIDTH_WITH_GUTTER_PX,
} from '../../../../../core/ui/grid/constants';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import useCurrentBreakpoint from '../../../../../core/ui/utils/useCurrentBreakpoint';
import EntityPageLayout from '../../../../journey/common/EntityPageLayout/EntityPageLayout';

type EntityTypeName = 'space' | 'challenge' | 'opportunity' | 'organization' | 'user';

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
  ...props
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);

  // TODO use EntityPageLayout inside EntitySettingsLayout
  const theme = useTheme();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const paddingBottom = isMobile ? 6 : 0;

  return (
    <EntityPageLayout currentSection={EntityPageSection.Settings} {...props}>
      <Box>
        <Box maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX} marginX="auto">
          <EntitySettingsTabs
            tabs={tabs}
            currentTab={currentTab}
            aria-label={`${entityTypeName} Settings tabs`}
            routePrefix={tabRoutePrefix}
            getTabLabel={getTabLabel}
          />
        </Box>
      </Box>
      <Box flexGrow={1} sx={{ backgroundColor: 'background.paper', paddingBottom }}>
        <Box maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX} marginX="auto">
          <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
            <SettingsPageContent
              currentSection={currentTab}
              entityTypeName={entityTypeName}
              tabDescriptionNs="pages.admin"
            >
              {children}
            </SettingsPageContent>
          </GridProvider>
        </Box>
      </Box>
    </EntityPageLayout>
  );
};

export default EntitySettingsLayout;
