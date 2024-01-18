import { Tab, TabProps } from '@mui/material';
import React, { forwardRef } from 'react';

interface HeaderNavigationButtonProps extends TabProps {}

// Special Tab with the class button-tab which makes it small an aligned to the end on the tabs bar
const HeaderNavigationButton = forwardRef<HTMLDivElement, HeaderNavigationButtonProps>(
  ({ value, icon, disabled, onClick }, ref) => {
    return (
      <Tab
        ref={ref}
        iconPosition="start"
        value={value}
        icon={icon}
        disabled={disabled}
        className="button-tab"
        onClick={onClick}
      />
    );
  }
);

export default HeaderNavigationButton;
