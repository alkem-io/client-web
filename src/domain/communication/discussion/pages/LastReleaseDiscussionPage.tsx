import { FC } from 'react';
import { usePlatformDiscussionsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';
import DiscussionPage from './DiscussionPage';

interface LastReleaseDiscussionPageProps {}

export const LastReleaseDiscussionPage: FC<LastReleaseDiscussionPageProps> = () => {
  const { data } = usePlatformDiscussionsQuery();

  const lastRelease = data?.platform.communication.discussions
    ?.filter(discussion => discussion.category === DiscussionCategory.Releases)
    ?.reduce((prev, current) => {
      return prev.timestamp && current.timestamp && prev.timestamp > current.timestamp ? prev : current;
    });

  return <DiscussionPage releaseId={lastRelease?.nameID} />;
};

export default LastReleaseDiscussionPage;
