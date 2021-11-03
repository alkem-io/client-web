import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import DiscussionListContainer from '../../containers/discussions/DiscussionListContainer';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks';
import { DiscussionListView } from '../../views/Discussions/DiscussionsListView';
import { PageProps } from '../common';

interface DiscussionsPageProps extends PageProps {}

export const DiscussionListPage: FC<DiscussionsPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  useUpdateNavigation({ currentPaths: paths });

  // TODO [ATS]:  this will be constructed depending on the community.
  const title = 'Discussions';

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={title} newUrl={`${url}/new`}>
        <DiscussionListContainer>
          {(_entities, _state) => (
            <DiscussionListView
              entities={{
                discussions: _entities.discussionList,
              }}
              state={{
                loading: _state.loading,
              }}
              actions={{}}
              options={{}}
            />
          )}
        </DiscussionListContainer>
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionListPage;
