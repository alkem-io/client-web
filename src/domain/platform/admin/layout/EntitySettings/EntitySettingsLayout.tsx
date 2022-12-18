import React, { ComponentType, FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../../common/components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { EntityTabsProps } from '../../../../challenge/common/EntityPageLayout';
import SimplePageLayout from '../../../../shared/layout/LegacyPageLayout/SimplePageLayout';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../../common/components/composite/layout/TopBar/TopBar';
import Main from '../../../../../common/components/composite/layout/App/Main';
import TopLevelDesktopLayout from '../../../../shared/layout/LegacyPageLayout/TopLevelDesktopLayout';

type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization' | 'user';

type EntitySettingsLayoutProps = {
  pageBannerComponent: ComponentType;
  tabsComponent: ComponentType<EntityTabsProps>;
  entityTypeName: EntityTypeName;
  tabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
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
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const content = (
    <SimplePageLayout currentSection={currentTab} entityTypeName={entityTypeName} tabDescriptionNs="pages.admin">
      {children}
    </SimplePageLayout>
  );

  if (isMobile) {
    return (
      <>
        <TopBar />
        <TopBarSpacer />
        <PageBanner />
        <PageTabs
          tabs={tabs}
          currentTab={currentTab}
          aria-label={`${entityTypeName} Settings tabs`}
          routePrefix={tabRoutePrefix}
          getTabLabel={getTabLabel}
        />
        <Main sx={{ marginTop: 2, marginBottom: 9, overflowX: 'auto' }}>{content}</Main>
        <Tabs currentTab={EntityPageSection.Settings} mobile />
      </>
    );
  } else {
    return (
      <TopLevelDesktopLayout>
        <PageBanner />
        <Tabs currentTab={EntityPageSection.Settings} />
        <PageTabs
          tabs={tabs}
          currentTab={currentTab}
          aria-label={`${entityTypeName} Settings tabs`}
          routePrefix={tabRoutePrefix}
          getTabLabel={getTabLabel}
        />
        {content}
      </TopLevelDesktopLayout>
    );
  }
};

export default EntitySettingsLayout;
