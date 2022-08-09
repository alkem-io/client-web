import React, { FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import { EntityLinkComponentProps } from '../../../../components/Admin/EntityLinkComponent';
import { SimplePageLayout } from '../../../shared/layout/PageLayout';
import PageBanner from '../../../shared/components/PageHeader/PageBanner';
import HeaderNavigationTabs from '../../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../../shared/components/PageHeader/HeaderNavigationTab';

type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization';

type EntitySettingsLayoutProps = EntityLinkComponentProps & {
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
  ...entityTitleProps
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);
  const getTabRoute = (tab: TabDefinition<string | number>) => {
    const { route } = tab;
    return `${tabRoutePrefix}${route}`;
  };

  return (
    <>
      <PageBanner title={entityTitleProps.displayName} />
      <HeaderNavigationTabs value={currentTab}>
        {tabs.map(tab => {
          return (
            <HeaderNavigationTab
              key={tab.route}
              label={getTabLabel(tab.section)}
              value={tab.section}
              to={getTabRoute(tab)}
            />
          );
        })}
      </HeaderNavigationTabs>

      <PageTabs
        tabs={tabs}
        currentTab={currentTab}
        aria-label={`${entityTypeName} Settings tabs`}
        routePrefix={tabRoutePrefix}
        getTabLabel={getTabLabel}
      />
      <SimplePageLayout currentSection={currentTab} entityTypeName={entityTypeName} tabDescriptionNs="pages.admin">
        {children}
      </SimplePageLayout>
    </>
  );
};

export default EntitySettingsLayout;
