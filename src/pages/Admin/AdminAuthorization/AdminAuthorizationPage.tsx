import React, { FC } from 'react';
import { managementData } from '../../../components/Admin/managementData';
import AdminLayout from '../../../components/composite/layout/AdminLayout/AdminLayout';
import { PageProps } from '../../common';
import { Container, Grid } from '@mui/material';
import Card from '../../../components/core/Card';
import Button from '../../../components/core/Button';
import { Link as RouterLink } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks';
import { AdminSection } from '../../../components/composite/layout/AdminLayout/constants';

interface AdminAuthorizationPageProps extends PageProps {}

const { buttons } = managementData.adminLvl.find(({ name }) => name === 'Authorization')!;

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
