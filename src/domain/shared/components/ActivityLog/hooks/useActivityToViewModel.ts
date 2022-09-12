import { ActivityLog } from '../ActivityLog';
import { ActivityLogViewProps } from '../views';
import { useAuthorsDetails } from '../../../../communication/useAuthorsDetails';
import { Author } from '../../AuthorAvatar/models/author';

interface ActivityToViewModelReturnType {
  activityViewModel: ActivityLogViewProps[] | undefined;
  getActivityViewModel: (activityLog: ActivityLog) => ActivityLogViewProps;
}

export const useActivityToViewModel = (activityLog?: ActivityLog[]): ActivityToViewModelReturnType => {
  const authorIds = activityLog?.map(x => x.triggeredBy);
  const { authors = [] } = useAuthorsDetails(authorIds ?? []);

  const getActivityViewModel = (activityLog: ActivityLog) => toActivityViewModel(activityLog, authors);

  const activityViewModel = activityLog?.map<ActivityLogViewProps>(activity => toActivityViewModel(activity, authors));

  return {
    activityViewModel,
    getActivityViewModel,
  };
};

const toActivityViewModel = (activityLog: ActivityLog, authors: Author[]) => ({
  author: authors.find(author => author.id === activityLog.triggeredBy),
  createdDate: activityLog.createdDate,
  description: activityLog.description,
});
