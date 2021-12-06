import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { UserMetadata } from '../../../../hooks';
import { AssociateCard, AssociateCardSkeleton, UserCardProps } from '../cards';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';

export interface DashboardCommunitySectionProps extends DashboardGenericSectionProps {
  entities: {
    users: UserCardProps[];
    user?: UserMetadata;
  };
  loading: {
    users?: boolean;
  };
}

const DashboardCommunitySection: FC<DashboardCommunitySectionProps> = ({ entities, loading, children, ...props }) => {
  const { users } = entities;

  return (
    <Section {...props}>
      {children}
      <Grid container spacing={1}>
        {loading.users &&
          Array.apply(null, { length: 6 } as any).map((_, i) => (
            <Grid item flexBasis={'16.6%'} key={i}>
              <AssociateCardSkeleton />
            </Grid>
          ))}
        {users.map((user, i) => {
          // const anonymousReadAccess = ecoverse?.authorization?.anonymousReadAccess;

          return (
            <Grid item flexBasis={'16.6%'} key={i}>
              <AssociateCard {...user} />
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );
};

export default DashboardCommunitySection;
