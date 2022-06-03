import Grid from '@mui/material/Grid';
import LoadingOrganizationCard from '../../shared/components/LoadingOrganizationCard';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import OrganizationCard, {
  OrganizationCardProps,
} from '../../../components/composite/common/cards/Organization/OrganizationCard';
import React from 'react';
import { Identifiable } from '../../shared/types/Identifiable';
import { useTranslation } from 'react-i18next';

export interface ContributingOrganizationsProps {
  loading?: boolean;
  organizations: (OrganizationCardProps & Identifiable)[] | undefined;
}

const ContributingOrganizations = ({ organizations, loading = false }: ContributingOrganizationsProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Grid container spacing={3}>
        <LoadingOrganizationCard />
        <LoadingOrganizationCard />
        <LoadingOrganizationCard />
      </Grid>
    );
  }

  if (organizations?.length === 0) {
    return (
      <Box component={Typography} display="flex" justifyContent="center">
        {t('pages.community.leading-organizations.no-data')}
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {organizations?.map(org => (
        <Grid
          key={org.id}
          item
          flexGrow={1}
          flexBasis="100%"
          maxWidth={{ xs: 'auto', sm: 'auto', md: 'auto', lg: '50%', xl: '50%' }}
        >
          <OrganizationCard
            url={org.url}
            members={org.members}
            avatar={org.avatar}
            name={org.name}
            role={org.role}
            information={org.information}
            verified={org.verified}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ContributingOrganizations;
