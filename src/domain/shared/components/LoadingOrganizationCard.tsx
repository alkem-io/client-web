import React from 'react';
import Grid from '@mui/material/Grid';
import OrganizationCardHorizontal from '../../community/contributor/organization/OrganizationCardHorizontal/OrganizationCardHorizontal';

const LoadingOrganizationCard = () => (
  <Grid item xs={4}>
    <OrganizationCardHorizontal loading />
  </Grid>
);

export default LoadingOrganizationCard;
