import React, { PropsWithChildren } from 'react';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { Text } from '../../../../core/ui/typography';
import { Box } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { OpenInNewOutlined } from '@mui/icons-material';

interface ReferencesListSmallItemProps {
  uri: string;
}

const ReferencesListSmallItem = ({ uri, children }: PropsWithChildren<ReferencesListSmallItemProps>) => {
  return (
    <Box component={RouterLink} to={uri} display="flex" gap={gutters(0.5)} alignItems="center">
      <OpenInNewOutlined fontSize="inherit" />
      <Text>{children}</Text>
    </Box>
  );
};

export default ReferencesListSmallItem;
