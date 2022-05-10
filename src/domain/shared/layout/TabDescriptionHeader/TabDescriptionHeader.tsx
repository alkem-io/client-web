import React, { FC, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

const splitIntoLines = (text: ReactNode, namespace?: string) => {
  if (Array.isArray(text)) {
    return text.map((item, i) => splitIntoLines(item, namespace ? `${namespace}.${i}` : `${i}`));
  }
  const lines = typeof text === 'string' ? text.split('\n') : [text];
  if (lines.length > 1) {
    return splitIntoLines(lines, namespace);
  }
  return <Typography key={namespace}>{lines[0]}</Typography>;
};

const TabDescriptionHeader: FC = ({ children }) => {
  return (
    <Box paddingY={2} gap={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      {splitIntoLines(children)}
    </Box>
  );
};

export default TabDescriptionHeader;
