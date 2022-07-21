import { Tab, TabProps } from '@mui/material';
import React, { forwardRef } from 'react';
import { RouterLink } from '../RouterLink';

interface NagivationTabProps extends TabProps {
  to: string;
}

const NavigationTab = forwardRef<HTMLAnchorElement, NagivationTabProps>(({ to, value, icon, label, disabled }, ref) => {
  return (
    <Tab
      ref={ref}
      iconPosition="start"
      component={RouterLink}
      to={to}
      value={value}
      icon={icon}
      label={label}
      disabled={disabled}
    />
  );
});

export default NavigationTab;
