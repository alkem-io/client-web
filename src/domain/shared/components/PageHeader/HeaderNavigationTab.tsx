import { Tab, TabProps } from '@mui/material';
import React, { forwardRef } from 'react';
import { RouterLink } from '../../../../common/components/core/RouterLink';

interface HeaderNavigationTabProps extends TabProps {
  to: string;
}

const HeaderNavigationTab = forwardRef<HTMLAnchorElement, HeaderNavigationTabProps>(
  ({ to, value, icon, label, disabled, className }, ref) => {
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
        className={className}
      />
    );
  }
);

export default HeaderNavigationTab;
