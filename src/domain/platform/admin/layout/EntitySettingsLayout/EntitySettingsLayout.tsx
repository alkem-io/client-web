import { ComponentType, PropsWithChildren, ReactElement, FC, ReactNode, useCallback } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SettingsSection } from './SettingsSection';
import EntitySettingsTabs, { TabDefinition } from './EntitySettingsTabs';
import { useTranslation } from 'react-i18next';
import SettingsPageContent from './SettingsPageContent';
import PageContent from '@/core/ui/content/PageContent';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';

type EntityTypeName = 'space' | 'subspace' | 'subsubspace' | 'organization' | 'user';

export interface EntityTabsProps {
  currentTab: { sectionIndex: number } | { section: EntityPageSection } | undefined;
  mobile?: boolean;
  onMenuOpen?: (open: boolean) => void;
  loading?: boolean;
}

export interface BasePageBannerProps {
  watermark?: ReactNode;
}

interface EntitySettingsLayoutProps extends PropsWithChildren {
  entityTypeName: EntityTypeName;
  subheaderTabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  backButton?: ReactNode;
  pageBannerComponent?: ComponentType<BasePageBannerProps>;
  pageBanner?: ReactElement<BasePageBannerProps>;
  tabsComponent?: ComponentType<EntityTabsProps>;
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
    </>
  );
};

export default EntitySettingsLayout;
