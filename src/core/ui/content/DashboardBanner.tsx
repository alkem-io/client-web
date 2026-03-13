import { CloseOutlined } from '@mui/icons-material';
import { Box, type BoxProps, IconButton } from '@mui/material';
import Gutters from '../grid/Gutters';
import { gutters } from '../grid/utils';
import RouterLink, { type RouterLinkProps } from '../link/RouterLink';
import PageContentBlock from './PageContentBlock';

interface DashboardBannerProps extends RouterLinkProps {
  onClose?: () => void;
  isLink?: boolean;
  containerProps?: BoxProps;
}

const DashboardBanner = ({ children, onClose, containerProps, isLink = true, ...props }: DashboardBannerProps) => (
  <PageContentBlock
    row={true}
    accent={true}
    disablePadding={true}
    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
  >
    <Box {...props} sx={{ flexGrow: 1 }} component={isLink ? RouterLink : Box}>
      <Gutters row={true} disablePadding={true} flexWrap="wrap" {...containerProps}>
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

export default DashboardBanner;
