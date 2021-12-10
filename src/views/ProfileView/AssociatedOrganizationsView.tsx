import { Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AssociatedOrganizationCard from '../../components/composite/common/cards/Organization/AssociatedOrganizationCard';
import ProfileCard, { ProfileCardProps } from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import AssociatedOrganizationContainer from '../../containers/organization/AssociatedOrganizationContainer';

interface AssociatedOrganizationsViewProps extends ProfileCardProps {
  organizationNameIDs: string[];
  dense?: boolean;
  loading?: boolean;
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
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <ProfileCard {...rest}>
      <Grid container spacing={1}>
        {loading && <SkeletonItem dense />}
        {!loading &&
          organizationNameIDs.map((oNameID, i) => (
            <AssociatedOrganizationContainer key={i} entities={{ organizationNameId: oNameID }}>
              {(entities, state) => (
                <Grid item xs={12} md={dense ? 6 : 12}>
                  <AssociatedOrganizationCard
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
            {t('associated-organizations-view.no-data', { name: rest.title })}{' '}
          </Grid>
        )}
      </Grid>
    </ProfileCard>
  );
};
export default AssociatedOrganizationsView;
