import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '../../../types/WithId';
import {
  ContributorCard,
  ContributorCardProps,
} from '../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import SectionHeader from '../../shared/components/Section/SectionHeader';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import { SectionSpacer } from '../../shared/components/Section/Section';

interface DashboardContributingUsersProps {
  headerText: string;
  users: WithId<ContributorCardProps>[] | undefined;
  usersCount: number | undefined;
}

const DashboardContributingUsers = ({ users, usersCount, headerText }: DashboardContributingUsersProps) => {
  return (
    <>
      <SectionHeader text={withOptionalCount(headerText, usersCount)} />
      <SectionSpacer />
      <Grid container spacing={2}>
        {users?.map(user => (
          <Grid key={user.id} item xs={3}>
            <ContributorCard {...user} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default DashboardContributingUsers;
