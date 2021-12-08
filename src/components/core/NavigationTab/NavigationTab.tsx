import { styled, Tab, TabProps } from '@mui/material';
import React from 'react';

const NavigationTab = styled((props: TabProps) => {
  return <Tab iconPosition="start" {...props} />;
})(({ theme }) => ({
  '&.Mui-selected': {
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
}));

export default NavigationTab as typeof Tab;
