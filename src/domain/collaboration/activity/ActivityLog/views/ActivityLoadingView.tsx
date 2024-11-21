import { times } from 'lodash';
import { ActivityBaseView } from './ActivityBaseView';

export const ActivityLoadingView = ({ rows }: { rows: number }) => (
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
