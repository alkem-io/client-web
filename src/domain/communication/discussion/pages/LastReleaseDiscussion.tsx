import { FC } from 'react';
import { useLatestReleaseDiscussionNameIdQuery } from '../../../../core/apollo/generated/apollo-hooks';
import DiscussionPage from './DiscussionPage';

interface LastReleaseDiscussionPageProps {}

export const LastReleaseDiscussion: FC<LastReleaseDiscussionPageProps> = () => {
  const { data, loading } = useLatestReleaseDiscussionNameIdQuery();

  const lastReleaseNameID = data?.platform.latestReleaseDiscussionNameID;

  if (loading) {
    return null;
  }

  if (!lastReleaseNameID) {
    throw new Error('No release discussions found');
  }

  return <DiscussionPage discussionNameId={lastReleaseNameID} />;
};

export default LastReleaseDiscussion;
