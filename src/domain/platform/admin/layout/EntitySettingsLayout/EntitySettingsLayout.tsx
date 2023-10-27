import React, { FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import EntitySettingsTabs, { TabDefinition } from './EntitySettingsTabs';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { EntityPageLayoutProps } from '../../../../journey/common/EntityPageLayout';
import SettingsPageContent from './SettingsPageContent';
import EntityPageLayout from '../../../../journey/common/EntityPageLayout/EntityPageLayout';
import PageContent from '../../../../../core/ui/content/PageContent';
import { PlatformNavigationBarProps } from '../../../../../main/ui/platformNavigation/PlatformNavigationBar';

type EntityTypeName = 'space' | 'challenge' | 'opportunity' | 'organization' | 'user';

interface EntitySettingsLayoutProps extends Omit<EntityPageLayoutProps, 'tabs' | 'currentSection'> {
  entityTypeName: EntityTypeName;
  tabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
}

// TODO Put LayoutHolder into Admin routes, making EntitySettingsLayout able to render EntityPageLayout.
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

  return (
    <EntityPageLayout currentSection={EntityPageSection.Settings} {...props}>
      <PageContent background="background.paper" gridContainerProps={{ paddingTop: 0 }}>
        <EntitySettingsTabs
          tabs={tabs}
          currentTab={currentTab}
          aria-label={`${entityTypeName} Settings tabs`}
          routePrefix={tabRoutePrefix}
          getTabLabel={getTabLabel}
        />
        <SettingsPageContent currentSection={currentTab} entityTypeName={entityTypeName} tabDescriptionNs="pages.admin">
          {children}
        </SettingsPageContent>
      </PageContent>
    </EntityPageLayout>
  );
};

export default EntitySettingsLayout;
