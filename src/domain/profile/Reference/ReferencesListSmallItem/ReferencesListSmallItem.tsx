import React, { ComponentType, PropsWithChildren } from 'react';
import RouterLink from '@/core/ui/link/RouterLink';
import { Text } from '@/core/ui/typography';
import { Box, SvgIconProps } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { OpenInNewOutlined } from '@mui/icons-material';

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
