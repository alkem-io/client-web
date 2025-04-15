import { styled, Tab, TabProps } from '@mui/material';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

interface NagivationTabProps extends TabProps {
  to: string;
  state?: Record<string, unknown>;
}

const StyledTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
})) as typeof Tab;

const NavigationTab = forwardRef<HTMLAnchorElement, NagivationTabProps>(
  ({ to, state, value, icon, label, disabled }, ref) => {
    return (
      <StyledTab
        ref={ref}
        iconPosition="start"
        component={Link}
        to={to}
        state={state}
        value={value}
        icon={icon}
        label={label}
        disabled={disabled}
      />
    );
  }
);

export default NavigationTab;
