import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { Container, Grid } from '@mui/material';
import AdminAuthorizationCard from './AdminAuthorizationCard';
import WrapperButton from '../../../../core/ui/button/deprecated/WrapperButton';
import { Link as RouterLink } from 'react-router-dom';
import { AdminSection } from '../layout/toplevel/constants';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';

const buttons = [
  {
    description: 'Global admins',
    url: `authorization/${AuthorizationCredential.GlobalAdmin}`,
  },
  {
    description: 'Global Community Read',
    url: `authorization/global-community-read/${AuthorizationCredential.GlobalCommunityRead}`,
  },
  {
    description: 'Global Support',
    url: `authorization/global-support/${AuthorizationCredential.GlobalSupport}`,
  },
  {
    description: 'Beta Testers',
    url: `authorization/beta-tester/${AuthorizationCredential.BetaTester}`,
  },
];

const AdminAuthorizationPage: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Authorization}>
      <Container maxWidth="xl">
        <AdminAuthorizationCard
          classes={{
            background: theme => theme.palette.neutral.main,
          }}
        >
          <Grid container spacing={2}>
            {buttons.map((btn, index) => (
              <Grid key={index} item>
                <WrapperButton as={RouterLink} to={`/admin/${btn.url}`} text={btn.description} />
              </Grid>
            ))}
          </Grid>
        </AdminAuthorizationCard>
      </Container>
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
