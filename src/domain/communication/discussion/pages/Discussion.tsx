import { FC } from 'react';
import DiscussionPage from './DiscussionPage';
import { useUrlParams } from '@core/routing/useUrlParams';

interface DiscussionPageProps {}

export const Discussion: FC<DiscussionPageProps> = () => {
  const { discussionNameId } = useUrlParams();

  if (!discussionNameId) {
    throw new Error('No discussionNameId found in URL params');
  }

  return <DiscussionPage discussionNameId={discussionNameId} />;
};

export default Discussion;
