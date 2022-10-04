import React, { FC } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { MetricItem } from '../MetricsPanel/Metrics';

export interface MetricsV2Props {
  metrics: MetricItem[];
}

const MetricsV2: FC<MetricsV2Props> = ({ metrics }) => {
  return (
    <Grid container spacing={1} direction="column">
      {metrics.map(({ count, name }, i) => (
        <Grid key={i} item>
          <Box component="span" paddingRight={0.5} fontWeight="bold">
            {count}
          </Box>
          {name}
        </Grid>
      ))}
    </Grid>
  );
};
export default MetricsV2;
