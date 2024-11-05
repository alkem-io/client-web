import React from 'react';
import PageContentBlock from './PageContentBlock';
import Gutters from '../grid/Gutters';
import RouterLink, { RouterLinkProps } from '../link/RouterLink';
import { Box, BoxProps, IconButton } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { gutters } from '../grid/utils';

interface DashboardBannerProps extends RouterLinkProps {
  onClose?: () => void;
  isLink?: boolean;
  containerProps?: BoxProps;
}

const DashboardBanner = ({ children, onClose, containerProps, isLink = true, ...props }: DashboardBannerProps) => {
  return (
    <PageContentBlock row accent disablePadding sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Box {...props} sx={{ flexGrow: 1 }} component={isLink ? RouterLink : Box}>
        <Gutters row flexWrap="wrap" {...containerProps}>
          {children}
        </Gutters>
      </Box>
      {onClose && (
        <IconButton color="primary" onClick={onClose} sx={{ marginX: gutters(0.5) }}>
          <CloseOutlined />
        </IconButton>
      )}
    </PageContentBlock>
  );
};

export default DashboardBanner;
