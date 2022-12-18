import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface PageContentBlockActionsProps extends BoxProps {}

export const PageContentBlockActions: FC<PageContentBlockActionsProps> = (props: PageContentBlockActionsProps) => {
  return <Box display="flex" gap={1} {...props} />;
};
