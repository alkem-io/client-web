import React, { FC } from 'react';
import { times } from 'lodash';
import { ActivityBaseView } from './ActivityBaseView';

interface ActivityLoadingViewProps {
  rows: number;
}

export const ActivityLoadingView: FC<ActivityLoadingViewProps> = ({ rows }) => {
  return (
    <>
      {times(rows, i => (
        <ActivityBaseView
          key={`_activity_log_loading_view_row_${i}`}
          loading
          type={undefined}
          avatarUrl={undefined}
          title=""
          url=""
          contextDisplayName=""
          createdDate=""
        />
      ))}
    </>
  );
};
