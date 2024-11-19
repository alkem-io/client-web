import DiscussionPage from './DiscussionPage';
import { useUrlParams } from '@/core/routing/useUrlParams';

export const Discussion = () => {
  const { discussionNameId } = useUrlParams();

  if (!discussionNameId) {
    throw new Error('No discussionNameId found in URL params');
  }

  return <DiscussionPage discussionNameId={discussionNameId} />;
};

export default Discussion;
