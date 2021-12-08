import React, { FC } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ActivityItem } from '../ActivityPanel/Activities';

export interface ActivitiesV2Props {
  activity: ActivityItem[];
}

const ActivitiesV2: FC<ActivitiesV2Props> = ({ activity }) => {
  return (
    <Grid container spacing={1} direction="column">
      {activity.map(({ digit, name }, i) => (
        <Grid key={i} item>
          <Box component="span" paddingRight={0.25} fontWeight="bold">
            {digit}
          </Box>
          {name}
        </Grid>
      ))}
    </Grid>
  );
};
export default ActivitiesV2;
