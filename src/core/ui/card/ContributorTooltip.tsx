import { Tooltip, TooltipProps } from '@mui/material';
import UserCard, { UserCardProps } from '@/domain/community/user/userCard/UserCard';
import RootThemeProvider from '../themes/RootThemeProvider';
import GridProvider from '../grid/GridProvider';
import { CONTRIBUTE_CARD_COLUMNS } from './ContributeCard';

interface ContributorTooltipProps extends UserCardProps {
  children: TooltipProps['children'];
}

const ContributorTooltip = ({ children, ...props }: ContributorTooltipProps) => (
  <Tooltip
    arrow
    title={
      <RootThemeProvider>
        <GridProvider columns={CONTRIBUTE_CARD_COLUMNS}>
          <UserCard {...props} />
        </GridProvider>
      </RootThemeProvider>
    }
    componentsProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent' } } } }}
  >
    {children}
  </Tooltip>
);

export default ContributorTooltip;
