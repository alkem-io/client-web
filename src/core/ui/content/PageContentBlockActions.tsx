import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface PageContentBlockActionsProps {
  justifyContent: BoxProps['justifyContent'];
}

export const PageContentBlockActions: FC<PageContentBlockActionsProps> = props => {
  return <Box display="flex" gap={1} {...props} />;
};
