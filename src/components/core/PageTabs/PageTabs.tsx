import React, { ComponentType } from 'react';
import { Tabs } from '@mui/material';
import { TabsProps } from '@mui/material/Tabs/Tabs';
import NavigationTab from '../../../components/core/NavigationTab/NavigationTab';

export interface TabDefinition<Section extends string | number> {
  section: Section;
  route: string;
  icon: ComponentType;
}

export interface PageTabsProps<Section extends string | number> extends TabsProps {
  currentTab: Section;
  tabs: TabDefinition<Section>[];
  getTabLabel: (section: Section) => string;
  routePrefix?: string;
}

const PageTabs = <Section extends string | number>({
  currentTab,
  tabs,
  getTabLabel,
  routePrefix = '',
  ...tabsPops
}: PageTabsProps<Section>) => {
  const getTabRoute = (tab: TabDefinition<Section>) => {
    const { route } = tab;
    return `${routePrefix}${route}`;
  };

  return (
    <Tabs value={currentTab} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile {...tabsPops}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <NavigationTab
            key={tab.route}
            icon={<Icon />}
            label={getTabLabel(tab.section)}
            value={tab.section}
            to={getTabRoute(tab)}
          />
        );
      })}
    </Tabs>
  );
};

export default PageTabs;
