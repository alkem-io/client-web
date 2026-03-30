import type { FC, PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import EntitySettingsTabs, { type TabDefinition } from './EntitySettingsTabs';
import SettingsPageContent from './SettingsPageContent';
import type { SettingsSection } from './SettingsSection';

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

  const getTabLabel = (section: SettingsSection) => t(`common.${section}` as const);

  return (
    <PageContent background="background.paper" gridContainerProps={{ paddingTop: 0 }}>
      <EntitySettingsTabs
        data-testid={`${entityTypeName}-settings`}
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
