import React, { FC } from 'react';
import { times } from 'lodash';
import { ActivityLogBaseView } from './ActivityLogBaseView';

interface ActivityLogLoadingView {
  rows: number;
}

export const ActivityLogLoadingView: FC<ActivityLogLoadingView> = ({ rows }) => {
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
