import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks';
import { DiscussionListView } from '../../views/Discussions/DiscussionsListView';
import { PageProps } from '../common';

interface DiscussionsPageProps extends PageProps {}

export const DiscussionListPage: FC<DiscussionsPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const { communityName } = useCommunityContext();
  const { discussionList, loading } = useDiscussionsContext();

  useUpdateNavigation({ currentPaths: paths });

  return (
    <ThemeProviderV2>
      <DiscussionsLayout
        title={t('components.discussions-list.name', { community: communityName })}
        newUrl={`${url}/new`}
      >
        {/* <DiscussionListContainer>
          {(_entities, _state) => ( */}
        <DiscussionListView
          entities={{
            discussions: discussionList,
          }}
          state={{
            loading: loading,
          }}
          actions={{}}
          options={{}}
        />
        {/* )}
        </DiscussionListContainer> */}
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionListPage;
