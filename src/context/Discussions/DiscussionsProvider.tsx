import { uniq, merge } from 'lodash';
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { ApolloError } from '@apollo/client';
import { useApolloErrorHandler, useConfig, useEcoverse } from '../../hooks';
import { useAuthorsDetails } from '../../hooks/communication/useAuthorsDetails';
import {
  CommunicationDiscussionMessageReceivedDocument,
  refetchCommunityDiscussionListQuery,
  useCommunityDiscussionListLazyQuery,
  useCommunityDiscussionListQuery,
  useCreateDiscussionMutation,
  useDeleteDiscussionMutation,
} from '../../hooks/generated/graphql';
import { Discussion } from '../../models/discussion/discussion';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../../models/enums/DiscussionCategoriesExt';
import {
  AuthorizationPrivilege,
  CommunicationDiscussionMessageReceivedSubscription,
  Discussion as DiscussionGraphql,
  DiscussionCategory,
} from '../../models/graphql-schema';
import { useCommunityContext } from '../CommunityProvider';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { buildDiscussionsUrl, buildDiscussionUrl } from '../../utils/urlBuilders';

interface Permissions {
  canCreateDiscussion: boolean;
}

interface DiscussionsContextProps {
  discussionList: Discussion[];
  handleCreateDiscussion: (title: string, category: DiscussionCategory, description: string) => Promise<void> | void;
  handleDeleteDiscussion: (ID: DiscussionGraphql['id']) => Promise<void> | void;
  permissions: Permissions;
  loading: boolean;
  posting: boolean;
  deleting: boolean;
}

const DiscussionsContext = React.createContext<DiscussionsContextProps>({
  discussionList: [],
  handleCreateDiscussion: (_title, _category, _description) => {},
  handleDeleteDiscussion: _ID => {},
  permissions: {
    canCreateDiscussion: false,
  },
  loading: false,
  posting: false,
  deleting: false,
});

interface DiscussionProviderProps {}

const DiscussionsProvider: FC<DiscussionProviderProps> = ({ children }) => {
  const history = useHistory();
  const { isFeatureEnabled } = useConfig();
  const handleError = useApolloErrorHandler();
  const { ecoverseNameId, loading: loadingEcoverse } = useEcoverse();
  const { communityId, communicationId, loading: loadingCommunity } = useCommunityContext();
  const { url } = useRouteMatch();

  const {
    data,
    loading: loadingDiscussionList,
    subscribeToMore,
  } = useCommunityDiscussionListQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      communityId: communityId || '',
    },
    errorPolicy: 'all',
    skip: !ecoverseNameId || !communityId,
    onError: handleError,
  });
  const [discussionListLazy] = useCommunityDiscussionListLazyQuery({
    fetchPolicy: 'network-only',
    variables: { ecoverseId: ecoverseNameId, communityId },
    onError: handleError,
  });

  useEffect(() => {
    if (!ecoverseNameId || !communityId || !isFeatureEnabled(FEATURE_SUBSCRIPTIONS)) {
      return;
    }

    const unSubscribe = subscribeToMore<CommunicationDiscussionMessageReceivedSubscription>({
      document: CommunicationDiscussionMessageReceivedDocument,
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      updateQuery: (prev, { subscriptionData }) => {
        const discussions = prev?.ecoverse?.community?.communication?.discussions;

        if (!discussions) {
          return prev;
        }

        const messageReceivedInfo = subscriptionData.data.communicationDiscussionMessageReceived;
        const discussionIndex = discussions.findIndex(x => x.id === messageReceivedInfo.discussionID);

        if (discussionIndex === -1) {
          // fetch new data from the server
          discussionListLazy();
          return prev;
        }

        const updatedDiscussions = [...discussions];
        const discussion = updatedDiscussions[discussionIndex];

        updatedDiscussions[discussionIndex] = {
          ...discussion,
          commentsCount: discussion.commentsCount + 1,
        };

        return merge({}, prev, {
          ecoverse: {
            community: {
              communication: {
                discussions: updatedDiscussions,
              },
            },
          },
        });
      },
    });
    return () => unSubscribe && unSubscribe();
  }, [isFeatureEnabled, subscribeToMore, ecoverseNameId, communityId]);

  const discussions = data?.ecoverse.community?.communication?.discussions || [];

  const senders = uniq([...discussions.map(d => d.createdBy)]);
  const { getAuthor, loading: loadingAuthors } = useAuthorsDetails(senders);

  const discussionList = discussions.map<Discussion>(x => {
    return {
      id: x.id,
      title: x.title,
      category: x.category,
      myPrivileges: [],
      author: getAuthor(x.createdBy || ''),
      authors: [],
      description: x.description,
      createdAt: x.timestamp ? new Date(x.timestamp) : new Date(),
      totalComments: x.commentsCount,
    };
  });

  const permissions: Permissions = useMemo(
    () => ({
      canCreateDiscussion:
        data?.ecoverse.community?.communication?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Create) ||
        false,
    }),
    [data]
  );

  const [createDiscussion, { loading: creatingDiscussion }] = useCreateDiscussionMutation({
    onCompleted: data => {
      history.replace(buildDiscussionUrl(url, data.createDiscussion.id));
    },
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        ecoverseId: ecoverseNameId,
      }),
    ],
  });

  const [deleteDiscussion, { loading: deletingDiscussion }] = useDeleteDiscussionMutation({
    onCompleted: () => history.replace(buildDiscussionsUrl(url)),
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        ecoverseId: ecoverseNameId,
      }),
    ],
  });

  const handleCreateDiscussion = async (title: string, category: DiscussionCategory, description: string) => {
    await createDiscussion({
      variables: {
        input: {
          communicationID: communicationId,
          description: description,
          title: title,
          category: category,
        },
      },
    });
  };

  const handleDeleteDiscussion = async (ID: string) => {
    await deleteDiscussion({
      variables: {
        deleteData: {
          ID,
        },
      },
    });
  };

  return (
    <DiscussionsContext.Provider
      value={{
        discussionList,
        handleCreateDiscussion,
        permissions,
        handleDeleteDiscussion,
        loading: loadingEcoverse || loadingCommunity || loadingDiscussionList || loadingAuthors,
        posting: creatingDiscussion,
        deleting: deletingDiscussion,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

const useDiscussionsContext = () => {
  return useContext(DiscussionsContext);
};

const useDiscussionCategoryFilter = (discussions: Discussion[]) => {
  const [categoryFilter, setCategoryFilter] = useState<DiscussionCategoryExt>(DiscussionCategoryExtEnum.All);
  const filtered = useMemo(() => {
    return discussions.filter(d => categoryFilter === DiscussionCategoryExtEnum.All || d.category === categoryFilter);
  }, [discussions, categoryFilter]);
  return { filtered, categoryFilter, setCategoryFilter };
};

export { DiscussionsProvider, DiscussionsContext, useDiscussionsContext, useDiscussionCategoryFilter };
