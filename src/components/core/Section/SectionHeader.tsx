import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';

const Spacer = () => <Box p={1} />;

interface SectionHeaderProps {
  text: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ text, children }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography
        variant="h4"
        fontWeight={600}
        dangerouslySetInnerHTML={{
          __html: text,
        }}
      />
      <Spacer />
      {children}
    </Box>
  );
};

export default SectionHeader;
