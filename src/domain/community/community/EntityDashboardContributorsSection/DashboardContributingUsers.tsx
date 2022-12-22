import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '../../../../types/WithId';
import {
  ContributorCard,
  ContributorCardProps,
} from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';

export interface DashboardContributingUsersProps {
  users: WithId<ContributorCardProps>[] | undefined;
}

const DashboardContributingUsers = ({ users }: DashboardContributingUsersProps) => {
  return (
    <Grid container spacing={2}>
      {users?.map(user => (
        <Grid key={user.id} item xs={3}>
          <ContributorCard {...user} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardContributingUsers;
