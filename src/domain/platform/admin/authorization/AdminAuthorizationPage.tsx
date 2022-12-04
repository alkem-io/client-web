import React, { FC } from 'react';
import AdminLayout from '../toplevel/AdminLayout';
import { PageProps } from '../../../shared/types/PageProps';
import { Container, Grid } from '@mui/material';
import Card from '../../../../common/components/core/Card';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import { Link as RouterLink } from 'react-router-dom';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { AdminSection } from '../toplevel/constants';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';

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
