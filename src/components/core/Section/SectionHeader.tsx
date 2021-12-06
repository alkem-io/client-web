import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import HelpButton from '../HelpButton';

const Spacer = () => <Box p={1} />;

interface SectionHeaderProps {
  text: string;
  helpText?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ text, helpText, children }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <Typography
          variant="h4"
          fontWeight={600}
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
        {helpText && <HelpButton helpText={helpText} />}
      </Box>
      <Spacer />
      {children}
    </Box>
  );
};

export default SectionHeader;
