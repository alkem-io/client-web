import PageContentBlock from './PageContentBlock';
import React from 'react';
import Gutters from '../grid/Gutters';
import RouterLink, { RouterLinkProps } from '../link/RouterLink';
import { BoxProps, IconButton } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { gutters } from '../grid/utils';

interface DashboardBannerProps extends RouterLinkProps {
  onClose?: () => void;
  containerProps?: BoxProps;
}

const DashboardBanner = ({ children, onClose, containerProps, ...props }: DashboardBannerProps) => {
  return (
    <PageContentBlock row accent disablePadding sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <RouterLink {...props} sx={{ flexGrow: 1 }}>
        <Gutters row flexWrap="wrap" {...containerProps}>
          {children}
        </Gutters>
      </RouterLink>
      {onClose && (
        <IconButton color="primary" onClick={onClose} sx={{ marginX: gutters(0.5) }}>
          <CloseOutlined />
        </IconButton>
      )}
    </PageContentBlock>
  );
};

export default DashboardBanner;
