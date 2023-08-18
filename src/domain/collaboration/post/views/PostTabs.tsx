import React, { FC } from 'react';
import { Box, IconButton, Tabs } from '@mui/material';
import { DashboardOutlined, SettingsOutlined, ShareOutlined } from '@mui/icons-material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import NavigationTab from '../../../../core/ui/tabs/NavigationTab';
import { usePost } from '../context/PostProvider';
import { PostDialogSection } from './PostDialogSection';
import { styled } from '@mui/styles';
import { gutters } from '../../../../core/ui/grid/utils';

export interface PostTabsProps {
  currentTab: PostDialogSection;
  onClose: () => void;
}

const RightAlignedTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-flexContainer': { justifyContent: 'end', gap: gutters(1)(theme) },
}));

const PostTabs: FC<PostTabsProps> = ({ currentTab, onClose }) => {
  const { permissions } = usePost();

  return (
    <RightAlignedTabs
      value={currentTab}
      aria-label="Post tabs"
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      <NavigationTab
        icon={<DashboardOutlined />}
        value={PostDialogSection.Dashboard}
        to={PostDialogSection.Dashboard}
        state={{ keepScroll: true }}
      />
      <NavigationTab
        icon={<ShareOutlined />}
        value={PostDialogSection.Share}
        to={PostDialogSection.Share}
        state={{ keepScroll: true }}
      />
      {permissions.canUpdate && (
        <NavigationTab
          icon={<SettingsOutlined />}
          value={PostDialogSection.Settings}
          to={PostDialogSection.Settings}
          state={{ keepScroll: true }}
        />
      )}
      <Box sx={{ display: 'flex', minWidth: 4, marginLeft: -1 }}>
        <IconButton onClick={onClose}>
          <CloseOutlinedIcon />
        </IconButton>
      </Box>
    </RightAlignedTabs>
  );
};

export default PostTabs;
