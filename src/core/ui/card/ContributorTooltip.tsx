import { Tooltip, TooltipProps } from '@mui/material';
import { FC } from 'react';
import UserCard, { UserCardProps } from '../../../common/components/composite/common/cards/user-card/UserCard';

interface ContributorTooltipProps extends UserCardProps {
  children: TooltipProps['children'];
}

const ContributorTooltip: FC<ContributorTooltipProps> = ({ children, ...props }) => {
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
