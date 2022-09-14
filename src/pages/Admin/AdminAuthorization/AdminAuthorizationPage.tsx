import React, { FC } from 'react';
import AdminLayout from '../../../domain/admin/toplevel/AdminLayout';
import { PageProps } from '../../common';
import { Container, Grid } from '@mui/material';
import Card from '../../../common/components/core/Card';
import Button from '../../../common/components/core/Button';
import { Link as RouterLink } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks';
import { AdminSection } from '../../../domain/admin/toplevel/constants';
import { AuthorizationCredential } from '../../../models/graphql-schema';

interface AdminAuthorizationPageProps extends PageProps {}

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
    description: 'Global Hubs Admins',
    url: `authorization/global-hubs/${AuthorizationCredential.GlobalAdminHubs}`,
  },
];

const AdminAuthorizationPage: FC<AdminAuthorizationPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

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
                <Button as={RouterLink} to={`/admin/${btn.url}`} text={btn.description} />
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
