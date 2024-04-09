import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { Box } from '@mui/material';

const createMarkdownList =
  (component: 'ul' | 'ol') =>
  ({ node, ...props }: ReactMarkdownProps) => {
    return <Box component={component} marginY={1} {...props} />;
  };

export default createMarkdownList;
