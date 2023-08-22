import { Tooltip, TooltipProps } from '@mui/material';
import UserCard, { UserCardProps } from '../../../domain/community/user/userCard/UserCard';

interface ContributorTooltipProps extends UserCardProps {
  children: TooltipProps['children'];
}

const ContributorTooltip = ({ children, ...props }: ContributorTooltipProps) => {
  return (
    <Tooltip
      arrow
      title={<UserCard {...props} />}
      componentsProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent' } } } }}
    >
      {children}
    </Tooltip>
  );
};

export default ContributorTooltip;
