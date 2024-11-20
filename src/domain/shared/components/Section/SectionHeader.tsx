import { Box, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import HelpButton from '@/core/ui/button/HelpButton';
import MetricCircleView from '@/domain/platform/metrics/MetricCircleView';

interface SectionHeaderProps {
  text: ReactNode;
  icon?: ReactNode;
  helpText?: string;
  counter?: number;
}

const SectionHeader: FC<SectionHeaderProps> = ({ text, icon, helpText, counter, children }) => {
  return (
    <Box
      display="flex"
      alignItems="start"
      flexWrap={{ xs: 'wrap', sm: 'wrap', md: 'nowrap' }}
      gap={2}
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center" flexGrow={1} flexShrink={1} flexBasis={{ xl: 0 }}>
        {icon}
        <Typography
          variant="h4"
          fontWeight={600}
          marginLeft={theme => (icon ? theme.spacing(1) : 0)}
          sx={{ wordBreak: 'break-word' }}
        >
          {text}
        </Typography>
        {typeof counter !== 'undefined' && (
          <Box sx={{ marginLeft: theme => theme.spacing(2) }}>
            <MetricCircleView color="primary">{counter}</MetricCircleView>
          </Box>
        )}
        {helpText && <HelpButton helpText={helpText} />}
      </Box>
      {children}
    </Box>
  );
};

export default SectionHeader;
