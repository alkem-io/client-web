import React, { FC } from 'react';
import { times } from 'lodash';
import { ActivityBaseView } from './ActivityBaseView';
import { Skeleton } from '@mui/material';

interface ActivityLoadingViewProps {
  rows: number;
}

const Footer = () => <Skeleton />;

export const ActivityLoadingView: FC<ActivityLoadingViewProps> = ({ rows }) => {
  return (
    <>
      {times(rows, i => (
        <ActivityBaseView
          key={`_activity_log_loading_view_row_${i}`}
          loading
          type={undefined}
          displayName={undefined}
          avatarUrl={undefined}
          title=""
          url=""
          footerComponent={Footer}
          contextDisplayName=""
          createdDate=""
        />
      ))}
    </>
  );
};
