import { useLatestReleaseDiscussionQuery } from '@/core/apollo/generated/apollo-hooks';
import DiscussionPage from './DiscussionPage';

export const LastReleaseDiscussion = () => {
  const { data, loading } = useLatestReleaseDiscussionQuery();

  const lastReleaseNameID = data?.platform?.latestReleaseDiscussion?.nameID;

  if (loading) {
    return null;
  }

  if (!lastReleaseNameID) {
    throw new Error('No release discussions found');
  }

  return <DiscussionPage discussionNameId={lastReleaseNameID!} />;
};

export default LastReleaseDiscussion;
