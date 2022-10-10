import { ActivityLogViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/communication/useAuthorsDetails';
import { Activity } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';
import { useCallback, useMemo } from 'react';

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityLogViewProps[] | undefined;
  getActivityViewModel: (activityLog: Activity) => ActivityLogViewProps;
  loading: boolean;
}

export const useActivityToViewModel = (activity?: Activity[]): ActivityToViewModelReturnType => {
  const authorIds = activity?.map(x => x.triggeredBy);
  const { authors = [], loading } = useAuthorsDetails(authorIds ?? []);

  const getActivityViewModel = useCallback(
    (activityLog: Activity) => toActivityViewModel(activityLog, authors),
    [authors]
  );

  const activityViewModel = useMemo(
    () => activity?.map<ActivityLogViewProps>(activity => toActivityViewModel(activity, authors)),
    [activity, authors]
  );

  return {
    activityViewModel,
    getActivityViewModel,
    loading,
  };
};

const toActivityViewModel = (activityLog: Activity, authors: Author[]) => ({
  resourceId: activityLog.resourceID,
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  description: activityLog.description,
});
