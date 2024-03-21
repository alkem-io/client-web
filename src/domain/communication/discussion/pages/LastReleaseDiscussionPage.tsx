import { FC } from 'react';
import { useLatestReleaseDiscussionNameIdQuery } from '../../../../core/apollo/generated/apollo-hooks';
import DiscussionPage from './DiscussionPage';

interface LastReleaseDiscussionPageProps {}

export const LastReleaseDiscussionPage: FC<LastReleaseDiscussionPageProps> = () => {
  const { data } = useLatestReleaseDiscussionNameIdQuery();

  const lastReleaseNameID = data?.platform.latestReleaseDiscussionNameID;

  return <DiscussionPage releaseId={lastReleaseNameID} />;
};

export default LastReleaseDiscussionPage;
