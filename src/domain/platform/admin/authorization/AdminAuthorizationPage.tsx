import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { Container, Grid } from '@mui/material';
import Card from '../../../../common/components/core/Card';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import { Link as RouterLink } from 'react-router-dom';
import { AdminSection } from '../layout/toplevel/constants';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';

const buttons = [
  {
    description: 'Global admins',
    url: `authorization/${AuthorizationCredential.GlobalAdmin}`,
  },
  {
    description: 'Global community admins',
    url: `authorization/global-community/${AuthorizationCredential.GlobalAdminCommunity}`,
  },
  {
    description: 'Global Spaces Admins',
    url: `authorization/global-spaces/${AuthorizationCredential.GlobalAdminSpaces}`,
  },
];

const AdminAuthorizationPage: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Authorization}>
      <Container maxWidth="xl">
        <Card
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
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
