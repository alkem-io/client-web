import React, { FC } from 'react';
import { Button, Tabs } from '@mui/material';
import { Close, DashboardOutlined, SettingsOutlined } from '@mui/icons-material';
import NavigationTab from '../../../components/core/NavigationTab/NavigationTab';
import { useAspect } from '../../../context/aspect/AspectProvider';
import { AspectDialogSection } from './AspectDialogSection';
import { styled } from '@mui/styles';

export interface AspectTabsProps {
  currentTab: AspectDialogSection;
  onClose: () => void;
}

const RightAlignedTabs = styled(Tabs)({
  '& .MuiTabs-flexContainer': { justifyContent: 'end' },
});

const AspectTabs: FC<AspectTabsProps> = ({ currentTab, onClose }) => {
  const { permissions } = useAspect();

  return (
    <RightAlignedTabs
      value={currentTab}
      aria-label="Aspect tabs"
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      <NavigationTab
        icon={<DashboardOutlined />}
        value={AspectDialogSection.Dashboard}
        to={AspectDialogSection.Dashboard}
        state={{ keepScroll: true }}
      />
      {permissions.canUpdate && (
        <NavigationTab
          icon={<SettingsOutlined />}
          value={AspectDialogSection.Settings}
          to={AspectDialogSection.Settings}
          state={{ keepScroll: true }}
        />
      )}
      <Button sx={{ minWidth: 4, marginLeft: -1 }} onClick={onClose}>
        <Close />
      </Button>
    </RightAlignedTabs>
  );
};
export default AspectTabs;
