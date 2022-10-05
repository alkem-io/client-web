import { styled, Tab, TabProps } from '@mui/material';
import React, { forwardRef } from 'react';

interface HeaderNavigationButtonProps extends TabProps {}
const ButtonizedTab = styled(Tab)(({ theme }) => ({
  flex: 'none !important',
  minWidth: 24,
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  top: '-1px !important',
}));

const HeaderNavigationButton = forwardRef<HTMLDivElement, HeaderNavigationButtonProps>(
  ({ value, icon, label, disabled, className, onClick }, ref) => {
    return (
      <ButtonizedTab
        ref={ref}
        iconPosition="start"
        value={value}
        icon={icon}
        label={label}
        disabled={disabled}
        className={className}
        onClick={onClick}
      />
    );
  }
);

export default HeaderNavigationButton;
