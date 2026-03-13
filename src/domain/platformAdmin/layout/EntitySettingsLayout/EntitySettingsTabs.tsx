import { Tabs } from '@mui/material';
import type { TabsProps } from '@mui/material/Tabs/Tabs';
import type { ComponentType } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import NavigationTab from '@/core/ui/tabs/NavigationTab';

export interface TabDefinition<Section extends string | number> {
  section: Section;
  route: string;
  icon: ComponentType;
}

export interface EntitySettingsTabsProps<Section extends string | number> extends TabsProps {
  currentTab: Section;
  tabs: TabDefinition<Section>[];
  getTabLabel: (section: Section) => string;
  routePrefix?: string;
}

const EntitySettingsTabs = <Section extends string | number>({
  currentTab,
  tabs,
  getTabLabel,
  routePrefix = '',
  ...tabsPops
}: EntitySettingsTabsProps<Section>) => {
  const getTabRoute = (tab: TabDefinition<Section>) => {
    const { route } = tab;
    return `${routePrefix}${route}`;
  };

  return (
    <Tabs
      value={currentTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile={true}
      sx={{
        '.MuiTabs-flexContainer': {
          gap: gutters(),
        },
        '.MuiTabs-hideScrollbar': {
          paddingX: gutters(),
        },
      }}
      {...tabsPops}
    >
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

export default EntitySettingsTabs;
