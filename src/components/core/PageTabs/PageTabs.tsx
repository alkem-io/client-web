import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tabs } from '@mui/material';
import { TabsProps } from '@mui/material/Tabs/Tabs';
import NavigationTab from '../../../components/core/NavigationTab/NavigationTab';

export interface TabDefinition<Section extends string | number> {
  section: Section;
  route: string;
}

export type IconMapping<Section extends string | number> = Record<Section, ComponentType>;

export interface PageTabsProps<Section extends string | number> extends TabsProps {
  currentTab: Section;
  tabs: TabDefinition<Section>[];
}

const createPageTabs =
  <Section extends string | number>(
    iconMapping: IconMapping<Section>,
    getTranslationLabel?: (section: Section) => string
  ): FC<PageTabsProps<Section>> =>
  ({ currentTab, tabs, ...tabsPops }) => {
    const { t } = useTranslation();

    return (
      <>
        <Tabs value={currentTab} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile {...tabsPops}>
          {tabs.map(tab => {
            const Icon = iconMapping[tab.section] as ComponentType;
            return (
              <NavigationTab
                key={tab.route}
                icon={<Icon />}
                label={getTranslationLabel && t(getTranslationLabel(tab.section) as Parameters<typeof t>[0])}
                value={tab.section}
                to={tab.route}
              />
            );
          })}
        </Tabs>
        <Box paddingTop={3} />
      </>
    );
  };

export default createPageTabs;
