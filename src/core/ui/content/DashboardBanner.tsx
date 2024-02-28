import PageContentBlock from './PageContentBlock';
import React from 'react';
import Gutters from '../grid/Gutters';
import RouterLink, { RouterLinkProps } from '../link/RouterLink';
import { IconButton } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { gutters } from '../grid/utils';

interface DashboardBannerProps extends RouterLinkProps {
  onClose?: () => void;
}

const DashboardBanner = ({ children, onClose, ...props }: DashboardBannerProps) => {
  return (
    <PageContentBlock row accent disablePadding sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <RouterLink {...props} sx={{ flexGrow: 1 }}>
        <Gutters row flexWrap="wrap">
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
