import React, { FC, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useApolloErrorHandler, useUpdateNavigation } from '../../hooks';
import { useCreateDiscussionMutation } from '../../hooks/generated/graphql';
import NewDiscussionView from '../../views/Discussions/NewDiscussionView';
import { PageProps } from '../common';

export interface NewDiscussionPageProps extends PageProps {}

const NewDiscussionPage: FC<NewDiscussionPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const handleError = useApolloErrorHandler();

  const { communicationId } = useCommunityContext();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'new', real: false }], [paths]);
  const [createDiscussion] = useCreateDiscussionMutation({
    onCompleted: data => history.replace(url.replace('/new', data.createDiscussion.id)),
    onError: handleError,
  });
  useUpdateNavigation({ currentPaths });

  // TODO [ATS]:  this will be constructed depending on the community.
  const title = 'Digital Twinning - Initiate Discussion';

  const handlePost = async ({ title, description }: { title: string; description: string }) => {
    await createDiscussion({
      variables: {
        input: {
          communicationID: communicationId,
          title,
          message: description,
        },
      },
    });
  };

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={title}>
        <NewDiscussionView onPost={handlePost} />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default NewDiscussionPage;
