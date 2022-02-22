import { Button, Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import OrganizationCard from '../../components/composite/common/cards/Organization/OrganizationCard';
import AssociatedOrganizationContainer from '../../containers/organization/AssociatedOrganizationContainer';
import { Link as RouterLink } from 'react-router-dom';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { buildNewOrganizationUrl } from '../../utils/urlBuilders';

interface AssociatedOrganizationsViewProps {
  organizationNameIDs: string[];
  dense?: boolean;
  loading?: boolean;
  canCreateOrganization?: boolean;
  title: string;
  helpText?: string;
}

const SkeletonItem = (props: { dense: boolean }) => (
  <Grid item xs={12} md={props.dense ? 6 : 12}>
    <Skeleton variant="rectangular" sx={{ height: theme => theme.spacing(8) }} />
  </Grid>
);

export const AssociatedOrganizationsView: FC<AssociatedOrganizationsViewProps> = ({
  organizationNameIDs,
  dense = false,
  loading,
  canCreateOrganization = false,
  title,
  helpText,
}) => {
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
          organizationNameIDs.map((oNameID, i) => (
            <AssociatedOrganizationContainer key={i} entities={{ organizationNameId: oNameID }}>
              {(entities, state) => (
                <Grid item xs={12} md={dense ? 6 : 12}>
                  <OrganizationCard
                    name={entities.name}
                    avatar={entities.avatar}
                    information={entities.information}
                    role={entities.role}
                    members={entities.membersCount}
                    verified={entities.verified}
                    url={entities.url}
                    loading={state.loading}
                  />
                </Grid>
              )}
            </AssociatedOrganizationContainer>
          ))}
        {!organizationNameIDs.length && (
          <Grid item xs={12} md={dense ? 6 : 12}>
            {t('associated-organizations-view.no-data', { name: title })}{' '}
          </Grid>
        )}
      </Grid>
    </DashboardGenericSection>
  );
};
export default AssociatedOrganizationsView;
