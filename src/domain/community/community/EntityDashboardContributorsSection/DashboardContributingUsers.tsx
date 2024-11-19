import { Grid } from '@mui/material';
import { WithId } from '@/core/utils/WithId';
import {
  ContributorCardSquare,
  ContributorCardSquareProps,
} from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';

export interface DashboardContributingUsersProps {
  users: WithId<ContributorCardSquareProps>[] | undefined;
}

const DashboardContributingUsers = ({ users }: DashboardContributingUsersProps) => (
  <Grid container spacing={2}>
    {users?.map(user => (
      <Grid key={user.id} item xs={3}>
        <ContributorCardSquare {...user} />
      </Grid>
    ))}
  </Grid>
);

export default DashboardContributingUsers;
