import React, { ComponentType, FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../../common/components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import { EntityLinkComponentProps } from '../../components/EntityLinkComponent';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { EntityTabsProps } from '../../../../shared/layout/PageLayout';
import SimplePageLayout from '../../../../shared/layout/PageLayout/SimplePageLayout';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../../common/components/composite/layout/TopBar/TopBar';
import Main from '../../../../../common/components/composite/layout/App/Main';
import Footer from '../../../../../common/components/composite/layout/App/Footer';

type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization' | 'user';

type EntitySettingsLayoutProps = EntityLinkComponentProps & {
  pageBannerComponent: ComponentType;
  tabsComponent: ComponentType<EntityTabsProps>;
  entityTypeName: EntityTypeName;
  tabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

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

  return (
    <>
      <TopBar />
      <TopBarSpacer />
      <PageBanner />
      <Tabs currentTab={EntityPageSection.Settings} mobile={isMobile} />
      {isMobile && (
        <PageTabs
          tabs={tabs}
          currentTab={currentTab}
          aria-label={`${entityTypeName} Settings tabs`}
          routePrefix={tabRoutePrefix}
          getTabLabel={getTabLabel}
        />
      )}
      <Main sx={isMobile ? { marginTop: 2, marginBottom: 9, overflowX: 'auto' } : undefined}>
        {!isMobile && (
          <PageTabs
            tabs={tabs}
            currentTab={currentTab}
            aria-label={`${entityTypeName} Settings tabs`}
            routePrefix={tabRoutePrefix}
            getTabLabel={getTabLabel}
          />
        )}
        <SimplePageLayout currentSection={currentTab} entityTypeName={entityTypeName} tabDescriptionNs="pages.admin">
          {children}
        </SimplePageLayout>
      </Main>
      {!isMobile && <Footer />}
    </>
  );
};

export default EntitySettingsLayout;
