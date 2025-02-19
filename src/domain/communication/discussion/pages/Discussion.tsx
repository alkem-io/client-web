import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import DiscussionPage from './DiscussionPage';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

export const Discussion = () => {
  const { discussionId, loading } = useUrlResolver();

  return <DiscussionPage discussionId={discussionId} loading={loading} />;
};

export default withUrlResolverParams(Discussion);
