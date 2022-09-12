import { ActivityLogViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/useAuthorsDetails';
import { Activity } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityLogViewProps[] | undefined;
  getActivityViewModel: (activityLog: Activity) => ActivityLogViewProps;
}

export const useActivityToViewModel = (activity?: Activity[]): ActivityToViewModelReturnType => {
  const authorIds = activity?.map(x => x.triggeredBy);
  const { authors = [] } = useAuthorsDetails(authorIds ?? []);

  const getActivityViewModel = (activityLog: Activity) => toActivityViewModel(activityLog, authors);

  const activityViewModel = activity?.map<ActivityLogViewProps>(activity => toActivityViewModel(activity, authors));

  return {
    activityViewModel,
    getActivityViewModel,
  };
};

const toActivityViewModel = (activityLog: Activity, authors: Author[]) => ({
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  description: activityLog.description,
});
