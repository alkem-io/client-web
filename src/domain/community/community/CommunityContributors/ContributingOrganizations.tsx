import React, { FC, ReactElement } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Skeleton } from '@mui/material';
import { Identifiable } from '../../../../core/utils/Identifiable';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import Loading from '../../../../core/ui/loading/Loading';
import { Caption } from '../../../../core/ui/typography';
import OrganizationVerifiedStatus from '../../organization/organizationVerifiedStatus/OrganizationVerifiedStatus';
import CircleTag from '../../../../core/ui/tags/CircleTag';

interface OrganizationCardProps {
  name?: string;
  avatar?: string;
  city?: string;
  country?: string;
  associatesCount?: number;
  verified?: boolean;
  loading?: boolean;
  url?: string;
}

export interface ContributingOrganizationsProps {
  loading?: boolean;
  organizations: (OrganizationCardProps & Identifiable)[] | undefined;
  noOrganizationsView?: ReactElement;
}

const ContributingOrganizations: FC<ContributingOrganizationsProps> = ({
  organizations,
  loading = false,
  noOrganizationsView,
}) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        <Loading />
      </Grid>
    );
  }

  if (organizations?.length === 0) {
    return noOrganizationsView ?? null;
  }

  const renderAssociatesCount = org => {
    return (
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <Box display="flex">
          <Caption sx={{ marginRight: 1, flexGrow: 1 }}>{loading ? <Skeleton /> : 'Associates'}</Caption>
          {loading ? (
            <Skeleton variant="circular">
              <CircleTag text={`${org.associatesCount}`} color="primary" size="small" />
            </Skeleton>
          ) : (
            <CircleTag text={`${org.associatesCount}`} color="primary" size="small" />
          )}
        </Box>
        {loading ? (
          <Skeleton>
            <OrganizationVerifiedStatus verified={Boolean(org.verified)} />
          </Skeleton>
        ) : (
          <OrganizationVerifiedStatus verified={Boolean(org.verified)} />
        )}
      </Box>
    );
  };

  const mappedOrganizations = organizations?.map(org => ({
    id: org.id,
    profile:
      {
        displayName: org.name || '',
        avatar: {
          uri: org.avatar || '',
        },
        location: {
          city: org.city,
          country: org.country,
        },
      } || undefined,
    url: org.url,
    index: renderAssociatesCount(org),
    onContact: () => {},
  }));

  return (
    <>
      {mappedOrganizations?.map(org => (
        <Grid item key={org.id} padding={0.5}>
          <ContributorCardHorizontal {...org} seamless />
        </Grid>
      ))}
    </>
  );
};

export default ContributingOrganizations;
