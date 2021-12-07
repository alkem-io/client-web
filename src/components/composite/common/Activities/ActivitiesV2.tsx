import React, { FC } from 'react';
import { Box } from '@mui/material';
import { ActivityItem } from '../ActivityPanel/Activities';

export interface ActivitiesV2Props {
  activity: ActivityItem[];
}

const ActivitiesV2: FC<ActivitiesV2Props> = ({ activity }) => {
  return (
    <Box>
      {activity.map(({ digit, name }) => (
        <>
          <Box fontWeight="bold">{digit}</Box>
          {name}
        </>
      ))}
    </Box>
  );
};
export default ActivitiesV2;
