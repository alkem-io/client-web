import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import DiscussionPage from './DiscussionPage';

export const Discussion = () => {
  const { discussionId } = useUrlResolver();

  return <DiscussionPage discussionId={discussionId} />;
};

export default Discussion;
