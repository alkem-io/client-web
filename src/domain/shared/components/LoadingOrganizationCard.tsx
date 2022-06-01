import React from 'react';
import Grid from '@mui/material/Grid';
import OrganizationCard from '../../../components/composite/common/cards/Organization/OrganizationCard';

const LoadingOrganizationCard = () => (
  <Grid item xs={4}>
    <OrganizationCard loading />
  </Grid>
);

export default LoadingOrganizationCard;
