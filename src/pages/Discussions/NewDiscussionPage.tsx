import React, { FC } from 'react';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import NewDiscussionView from '../../views/Discussions/NewDiscussionView';

export interface NewDiscussionPageProps {}

const NewDiscussionPage: FC<NewDiscussionPageProps> = () => {
  const { handleCreateDiscussion } = useDiscussionsContext();
  const { communityName } = useCommunityContext();

  const title = `${communityName} - Initiate Discussion`;

  return (
    <DiscussionsLayout title={title}>
      <NewDiscussionView onPost={values => handleCreateDiscussion(values.title, values.category, values.description)} />
    </DiscussionsLayout>
  );
};
export default NewDiscussionPage;
