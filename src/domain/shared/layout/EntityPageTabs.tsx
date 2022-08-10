import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTabs from '../components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../components/PageHeader/HeaderNavigationTab';
import { EntityPageSection } from './EntityPageSection';
import { EntityTypeName } from './PageLayout/SimplePageLayout';

export interface EntityPageTabsProps {
  currentTab: EntityPageSection;
  showSettings: boolean;
  settingsUrl: string;
  entityTypeName: EntityTypeName;
  subEntityTab?: ReactNode;
  rootUrl: string;
}

const EntityPageTabs: FC<EntityPageTabsProps> = ({
  currentTab,
  showSettings,
  settingsUrl,
  entityTypeName,
  subEntityTab,
  rootUrl,
}) => {
  const { t } = useTranslation();

  return (
    <HeaderNavigationTabs
      value={currentTab}
      aria-label={`${entityTypeName} tabs`}
      showSettings={showSettings}
      settingsUrl={settingsUrl}
    >
      <HeaderNavigationTab
        label={t('common.dashboard')}
        value={EntityPageSection.Dashboard}
        to={`${rootUrl}/${EntityPageSection.Dashboard}`}
      />
      <HeaderNavigationTab
        label={t('common.explore')}
        value={EntityPageSection.Explore}
        to={`${rootUrl}/${EntityPageSection.Explore}`}
      />
      {subEntityTab}
      <HeaderNavigationTab
        label={t('common.about')}
        value={EntityPageSection.About}
        to={`${rootUrl}/${EntityPageSection.About}`}
      />
    </HeaderNavigationTabs>
  );
};

export default EntityPageTabs;
