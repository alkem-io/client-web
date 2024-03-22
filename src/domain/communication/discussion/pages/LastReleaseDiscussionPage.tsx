import { FC } from 'react';
import { useLatestReleaseDiscussionQuery } from '../../../../core/apollo/generated/apollo-hooks';
import DiscussionPage from './DiscussionPage';

interface LastReleaseDiscussionPageProps {}

export const LastReleaseDiscussionPage: FC<LastReleaseDiscussionPageProps> = () => {
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  const lastReleaseNameID = data?.platform.latestReleaseDiscussion.nameID;

  return <DiscussionPage releaseId={lastReleaseNameID} />;
};

export default LastReleaseDiscussionPage;
