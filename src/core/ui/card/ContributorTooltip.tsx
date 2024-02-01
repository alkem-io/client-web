import { Tooltip, TooltipProps } from '@mui/material';
import UserCard, { UserCardProps } from '../../../domain/community/user/userCard/UserCard';
import RootThemeProvider from '../themes/RootThemeProvider';

interface ContributorTooltipProps extends UserCardProps {
  children: TooltipProps['children'];
}

const ContributorTooltip = ({ children, ...props }: ContributorTooltipProps) => {
  return (
    <Tooltip
      arrow
      title={
        <RootThemeProvider>
          <UserCard {...props} />
        </RootThemeProvider>
      }
      componentsProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent' } } } }}
    >
      {children}
    </Tooltip>
  );
};

export default ContributorTooltip;
