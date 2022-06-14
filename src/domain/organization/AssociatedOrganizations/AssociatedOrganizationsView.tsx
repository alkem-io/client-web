import React, { ReactElement } from 'react';
import { Button, Grid, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import { buildNewOrganizationUrl } from '../../../utils/urlBuilders';

export interface AssociatedOrganizationsViewProps<
  Consumed extends {},
  Organization extends Consumed & { nameID: string }
> {
  organizations: Organization[] | undefined;
  dense?: boolean;
  loading?: boolean;
  canCreateOrganization?: boolean;
  title: string;
  helpText?: string;
  organizationCardComponent: (organization: Consumed) => ReactElement | null;
}

const SkeletonItem = (props: { dense: boolean }) => (
  <Grid item xs={12} md={props.dense ? 6 : 12}>
    <Skeleton variant="rectangular" sx={{ height: theme => theme.spacing(8) }} />
  </Grid>
);

export const AssociatedOrganizationsView = <Consumed extends {}, Organization extends Consumed & { nameID: string }>({
  organizations,
  dense = false,
  loading,
  canCreateOrganization = false,
  title,
  helpText,
  organizationCardComponent: OrganizationCardComponent,
}: AssociatedOrganizationsViewProps<Consumed, Organization>) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={title}
      helpText={helpText}
      primaryAction={
        canCreateOrganization && (
          <Button variant="contained" component={RouterLink} to={buildNewOrganizationUrl()}>
            {t('buttons.create')}
          </Button>
        )
      }
    >
      <Grid container spacing={1}>
        {loading && <SkeletonItem dense />}
        {!loading &&
          organizations?.map(org => (
            <Grid key={org.nameID} item xs={12} md={dense ? 6 : 12}>
              <OrganizationCardComponent {...org} />
            </Grid>
          ))}
        {organizations?.length === 0 && (
          <Grid item xs={12} md={dense ? 6 : 12}>
            {t('associated-organizations-view.no-data', { name: title })}{' '}
          </Grid>
        )}
      </Grid>
    </DashboardGenericSection>
  );
};

export default AssociatedOrganizationsView;
