import { useLatestReleaseDiscussionQuery } from '@/core/apollo/generated/apollo-hooks';
import DiscussionPage from './DiscussionPage';

export const LastReleaseDiscussion = () => {
  const { data, loading } = useLatestReleaseDiscussionQuery();

  const lastReleaseDiscussionId = data?.platform?.latestReleaseDiscussion?.id;

  if (loading) {
    return null;
  }

  if (!lastReleaseDiscussionId) {
    throw new Error('No release discussions found');
  }

  return <DiscussionPage discussionId={lastReleaseDiscussionId!} loading={loading} />;
};

export default LastReleaseDiscussion;
