import { OpenInNewOutlined } from '@mui/icons-material';
import { Box, type SvgIconProps } from '@mui/material';
import type { ComponentType, PropsWithChildren } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import { Text } from '@/core/ui/typography';

interface ReferencesListSmallItemProps {
  uri: string;
  iconComponent?: ComponentType<SvgIconProps>;
}

const ReferencesListSmallItem = ({
  uri,
  iconComponent: Icon = OpenInNewOutlined,
  children,
}: PropsWithChildren<ReferencesListSmallItemProps>) => {
  return (
    <Box component={RouterLink} to={uri} display="flex" gap={gutters(0.5)} alignItems="center">
      <Icon fontSize="inherit" />
      <Text>{children}</Text>
    </Box>
  );
};

export default ReferencesListSmallItem;
