import { Tooltip, TooltipProps } from '@mui/material';
import UserCard, { UserCardProps } from '@/domain/community/user/userCard/UserCard';
import RootThemeProvider from '../themes/RootThemeProvider';
import GridProvider from '../grid/GridProvider';
import { CONTRIBUTE_CARD_COLUMNS } from './ContributeCard';

interface ContributorTooltipProps extends UserCardProps {
  children: TooltipProps['children'];
}

/**
 * @deprecated Use the other ContributorTooltip component in domain/community,
 * which only needs the contributorId and contributorType props and
 * retrieves the data from the server when the tooltip is opened.
 */
const ContributorTooltip = ({ children, ...props }: ContributorTooltipProps) => (
  <Tooltip
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
