import Grid from '@mui/material/Grid';
import LoadingUserCard from '../../shared/components/LoadingUserCard';
import Typography from '@mui/material/Typography';
import { UserCard } from '../../../components/composite/common/cards';
import React from 'react';
import { SearchableUserCardProps } from '../CommunityUpdates/CommunityUpdatesDashboardSection';
import { useTranslation } from 'react-i18next';

export interface ContributingUsersProps {
  loading?: boolean;
  users: SearchableUserCardProps[] | undefined;
}

const ContributingUsers = ({ users, loading = false }: ContributingUsersProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Grid container spacing={3}>
        <LoadingUserCard />
        <LoadingUserCard />
        <LoadingUserCard />
      </Grid>
    );
  }

  if (!users?.length) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Typography>{t('pages.community.members.no-data')}</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {users.map(user => (
        <Grid
          key={user.id}
          item
          flexGrow={1}
          flexBasis="25%"
          maxWidth={{ xs: 'auto', sm: 'auto', md: '50%', lg: '33%', xl: '25%' }}
        >
          <UserCard
            displayName={user.displayName}
            tags={user.tags}
            avatarSrc={user.avatarSrc}
            roleName={user.roleName}
            country={user.country}
            city={user.city}
            url={user.url}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ContributingUsers;
