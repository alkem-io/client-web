import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import DiscussionPage from './DiscussionPage';

export const Discussion = () => {
  const { discussionId, loading } = useUrlResolver();

  return <DiscussionPage discussionId={discussionId} loading={loading} />;
};

export default Discussion;
