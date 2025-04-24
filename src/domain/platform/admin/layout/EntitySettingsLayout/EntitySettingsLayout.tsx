import { FC, ReactNode, useCallback } from 'react';
import { SettingsSection } from './SettingsSection';
import EntitySettingsTabs, { TabDefinition } from './EntitySettingsTabs';
import { useTranslation } from 'react-i18next';
import { EmptyLayout, EntityPageLayoutProps } from '@/domain/space/layout/EntityPageLayout';
import SettingsPageContent from './SettingsPageContent';
import PageContent from '@/core/ui/content/PageContent';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';

type EntityTypeName = 'space' | 'subspace' | 'subsubspace' | 'organization' | 'user';

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
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);

  return (
    <>
      <PageContent background="background.paper" gridContainerProps={{ paddingTop: 0 }}>
        <EntitySettingsTabs
          tabs={subheaderTabs}
          currentTab={currentTab}
          aria-label={`${entityTypeName} Settings tabs`}
          routePrefix={tabRoutePrefix}
          getTabLabel={getTabLabel}
        />
        {backButton}
        <SettingsPageContent currentSection={currentTab} entityTypeName={entityTypeName} tabDescriptionNs="pages.admin">
          {children}
        </SettingsPageContent>
      </PageContent>
      {/* EmptyLayout is needed to remove the previous propagated layout from the holder */}
      {/* Remove this when EntitySettingsLayout becomes a propagated one */}
      <EmptyLayout />
    </>
  );
};

export default EntitySettingsLayout;
