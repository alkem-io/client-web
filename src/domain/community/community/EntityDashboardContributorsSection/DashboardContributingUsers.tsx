import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '@core/utils/WithId';
import {
  ContributorCardSquare,
  ContributorCardSquareProps,
} from '../../contributor/ContributorCardSquare/ContributorCardSquare';

export interface DashboardContributingUsersProps {
  users: WithId<ContributorCardSquareProps>[] | undefined;
}

const DashboardContributingUsers = ({ users }: DashboardContributingUsersProps) => {
  return (
    <Grid container spacing={2}>
      {users?.map(user => (
        <Grid key={user.id} item xs={3}>
          <ContributorCardSquare {...user} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardContributingUsers;
