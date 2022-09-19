import React, { FC } from 'react';
import { times } from 'lodash';
import { ActivityLogBaseView } from './ActivityLogBaseView';

interface ActivityLogLoadingViewProps {
  rows: number;
}

export const ActivityLogLoadingView: FC<ActivityLogLoadingViewProps> = ({ rows }) => {
  return (
    <>
      {times(rows, i => (
        <ActivityLogBaseView
          key={`_activity_log_loading_view_row_${i}`}
          loading
          author={undefined}
          createdDate=""
          action=""
          description=""
        />
      ))}
    </>
  );
};
