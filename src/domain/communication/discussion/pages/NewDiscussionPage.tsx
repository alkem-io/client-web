import React, { FC, useMemo } from 'react';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { useDiscussionsContext } from '../providers/DiscussionsProvider';
import NewDiscussionView from '../views/NewDiscussionView';
import { PageProps } from '../../../shared/types/PageProps';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';

export interface NewDiscussionPageProps extends PageProps {}
/**
 * @deprecated
 */
const NewDiscussionPage: FC<NewDiscussionPageProps> = ({ paths }) => {
  const { handleCreateDiscussion } = useDiscussionsContext();

  const currentPaths = useMemo(() => [...paths, { value: '/new', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <DiscussionsLayout>
      <NewDiscussionView onPost={values => handleCreateDiscussion(values.title, values.category, values.description)} />
    </DiscussionsLayout>
  );
};

export default NewDiscussionPage;
