import React, { FC, ReactNode, useCallback } from 'react';
import { SettingsSection } from './constants';
import EntitySettingsTabs, { TabDefinition } from './EntitySettingsTabs';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { EmptyLayout, EntityPageLayoutProps } from '@/domain/journey/common/EntityPageLayout';
import SettingsPageContent from './SettingsPageContent';
import EntityPageLayout from '@/domain/journey/common/EntityPageLayout/EntityPageLayout';
import PageContent from '@/core/ui/content/PageContent';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';

type EntityTypeName = JourneyTypeName | 'organization' | 'user';

interface EntitySettingsLayoutProps extends Omit<EntityPageLayoutProps, 'tabs' | 'currentSection'> {
  entityTypeName: EntityTypeName;
  subheaderTabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  backButton?: ReactNode;
}

const EntitySettingsLayout: FC<EntitySettingsLayoutProps> = ({
  entityTypeName,
  subheaderTabs,
  currentTab,
  tabRoutePrefix = '../',
  children,
  backButton,
  ...props
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);

  return (
    <>
      <EntityPageLayout currentSection={EntityPageSection.Settings} {...props}>
        <PageContent background="background.paper" gridContainerProps={{ paddingTop: 0 }}>
          <EntitySettingsTabs
            tabs={subheaderTabs}
            currentTab={currentTab}
            aria-label={`${entityTypeName} Settings tabs`}
            routePrefix={tabRoutePrefix}
            getTabLabel={getTabLabel}
          />
          {backButton}
          <SettingsPageContent
            currentSection={currentTab}
            entityTypeName={entityTypeName}
            tabDescriptionNs="pages.admin"
          >
            {children}
          </SettingsPageContent>
        </PageContent>
      </EntityPageLayout>
      {/* EmptyLayout is needed to remove the previous propagated layout from the holder */}
      {/* Remove this when EntitySettingsLayout becomes a propagated one */}
      <EmptyLayout />
    </>
  );
};

export default EntitySettingsLayout;
