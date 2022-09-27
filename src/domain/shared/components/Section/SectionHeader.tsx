import { Box, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import HelpButton from '../../../../common/components/core/HelpButton';
import ActivityCircleView from '../../../platform/activity/ActivityCircleView';
import { SectionSpacer } from './Section';

interface SectionHeaderProps {
  text: ReactNode;
  icon?: ReactNode;
  helpText?: string;
  counter?: number;
}

const SectionHeader: FC<SectionHeaderProps> = ({ text, icon, helpText, counter, children }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        {icon}
        <Typography variant="h4" fontWeight={600} marginLeft={theme => (icon ? theme.spacing(1) : 0)}>
          {text}
        </Typography>
        {counter && (
          <Box sx={{ marginLeft: theme => theme.spacing(2) }}>
            <ActivityCircleView color="primary">{counter}</ActivityCircleView>
          </Box>
        )}
        {helpText && <HelpButton helpText={helpText} />}
      </Box>
      <SectionSpacer />
      {children}
    </Box>
  );
};

export default SectionHeader;
