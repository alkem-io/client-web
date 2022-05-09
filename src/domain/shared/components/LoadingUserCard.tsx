import React from 'react';
import Grid from '@mui/material/Grid';
import { UserCard } from '../../../common/components/composite/common/cards';

const LoadingUserCard = () => (
  <Grid item xs={3}>
    <UserCard loading />
  </Grid>
);

export default LoadingUserCard;
