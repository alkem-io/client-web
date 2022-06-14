import { Box, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import HelpButton from '../HelpButton';
import { SectionSpacer } from './Section';

interface SectionHeaderProps {
  text: ReactNode;
  helpText?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ text, helpText, children }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <Typography variant="h4" fontWeight={600}>
          {text}
        </Typography>
        {helpText && <HelpButton helpText={helpText} />}
      </Box>
      <SectionSpacer />
      {children}
    </Box>
  );
};

export default SectionHeader;
