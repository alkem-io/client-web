import React, { FC, useMemo } from 'react';
import DiscussionsLayout from '../../common/components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../domain/community/CommunityContext';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import NewDiscussionView from '../../views/Discussions/NewDiscussionView';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';

export interface NewDiscussionPageProps extends PageProps {}

const NewDiscussionPage: FC<NewDiscussionPageProps> = ({ paths }) => {
  const { handleCreateDiscussion } = useDiscussionsContext();
  const { communityName } = useCommunityContext();

  const title = `${communityName} - Initiate Discussion`;

  const currentPaths = useMemo(() => [...paths, { value: '/new', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <DiscussionsLayout title={title}>
      <NewDiscussionView onPost={values => handleCreateDiscussion(values.title, values.category, values.description)} />
    </DiscussionsLayout>
  );
};
export default NewDiscussionPage;
