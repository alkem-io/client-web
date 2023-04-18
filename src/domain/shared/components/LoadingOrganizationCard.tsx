import React from 'react';
import Grid from '@mui/material/Grid';
import OrganizationCardSquare from '../../community/contributor/organization/OrganizationCardSquare/OrganizationCardSquare';

const LoadingOrganizationCard = () => (
  <Grid item xs={4}>
    <OrganizationCardSquare loading />
  </Grid>
);

export default LoadingOrganizationCard;
