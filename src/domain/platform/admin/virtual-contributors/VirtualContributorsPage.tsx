import React, { FC, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import Gutters from '../../../../core/ui/grid/Gutters';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useAdminVirtualContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid } from '@mui/material';
import Avatar from '../../../../core/ui/avatar/Avatar';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { ExpandMore } from '@mui/icons-material';
import VirtualContributorForm from './VirtualContributorForm';
import { Actions } from '../../../../core/ui/actions/Actions';

const VirtualContributorsPage: FC = () => {
  const { t } = useTranslation();
  const { data, refetch } = useAdminVirtualContributorsQuery();
  const location = useLocation();

  useEffect(() => {
    refetch();
  }, []);

  let pathname = location.pathname;
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <Grid container justifyContent="flex-end">
        <Actions>
          <Link to={`${pathname}/new-persona`}>
            <Button variant="text">New Persona</Button>
          </Link>
          <Link to={`${pathname}/new-virtual-contributor`}>
            <Button variant="text">New Virtual Contributor</Button>
          </Link>
        </Actions>
      </Grid>
      <PageContentBlock>
        {data?.virtualContributors.map(virtualContributor => (
          <Accordion key={virtualContributor.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Gutters row alignItems="center">
                <Avatar
                  src={virtualContributor.profile.avatar?.uri}
                  alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
                />
                <BlockTitle>{virtualContributor.profile.displayName}</BlockTitle>
              </Gutters>
            </AccordionSummary>
            <AccordionDetails>
              <VirtualContributorForm virtualContributor={virtualContributor} />
            </AccordionDetails>
          </Accordion>
        ))}
      </PageContentBlock>
    </AdminLayout>
  );
};

export default VirtualContributorsPage;
