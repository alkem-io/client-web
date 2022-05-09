import React, { ComponentType, FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../common/components/core/PageTabs/PageTabs';
import { useTranslation } from 'react-i18next';
import { EntityLinkComponentProps } from '../../components/EntityLinkComponent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { EntityTabsProps } from '../../../shared/layout/PageLayout/EntityPageLayout';
import SimplePageLayout from '../../../shared/layout/PageLayout/SimplePageLayout';
type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization';

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

  return (
    <>
      <PageBanner />
      {Tabs && <Tabs currentTab={EntityPageSection.Settings} />}

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
