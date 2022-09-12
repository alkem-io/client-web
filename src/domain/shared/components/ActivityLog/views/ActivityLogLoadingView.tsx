import React, { FC } from 'react';
import { times } from 'lodash';
import { Skeleton } from '@mui/material';

interface ActivityLogLoadingView {
  rows: number;
}

export const ActivityLogLoadingView: FC<ActivityLogLoadingView> = ({ rows }) => {
  return (
    <>
      {times(rows, i => (
        <LoadingView key={`_activity_log_loading_view_row_${i}`} />
      ))}
    </>
  );
};

// todo put loading skeleton here
const LoadingView = () => <Skeleton />;
