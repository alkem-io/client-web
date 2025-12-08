import { PropsWithChildren, FC, ReactNode, useCallback } from 'react';
import { SettingsSection } from './SettingsSection';
import EntitySettingsTabs, { TabDefinition } from './EntitySettingsTabs';
import { useTranslation } from 'react-i18next';
import SettingsPageContent from './SettingsPageContent';
import PageContent from '@/core/ui/content/PageContent';

type EntityTypeName = 'space' | 'subspace' | 'subsubspace' | 'organization' | 'user';

interface EntitySettingsLayoutProps extends PropsWithChildren {
  entityTypeName: EntityTypeName;
  subheaderTabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
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
  );
};

export default EntitySettingsLayout;
