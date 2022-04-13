import { ApolloError } from '@apollo/client';
import { merge, uniq } from 'lodash';
import React, { FC, useContext, useEffect, useMemo } from 'react';
import { useNavigate, useResolvedPath } from 'react-router-dom';
import { useApolloErrorHandler, useConfig, useHub } from '../../hooks';
import { useAuthorsDetails } from '../../hooks/communication/useAuthorsDetails';
import {
  CommunicationDiscussionUpdatedDocument,
  refetchCommunityDiscussionListQuery,
  useCommunityDiscussionListQuery,
  useCreateDiscussionMutation,
  useDeleteDiscussionMutation,
} from '../../hooks/generated/graphql';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';
import { Discussion } from '../../models/discussion/discussion';
import {
  AuthorizationPrivilege,
  Discussion as DiscussionGraphql,
  DiscussionCategory,
  CommunicationDiscussionUpdatedSubscription,
  SubscriptionCommunicationDiscussionUpdatedArgs,
} from '../../models/graphql-schema';
import { useCommunityContext } from '../CommunityProvider';
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
  const navigate = useNavigate();
  const { pathname } = useResolvedPath('.');
  const { isFeatureEnabled } = useConfig();
  const handleError = useApolloErrorHandler();
  const { hubNameId, loading: loadingHub } = useHub();
  const { communityId, communicationId, loading: loadingCommunity } = useCommunityContext();

  const {
    data,
    loading: loadingDiscussionList,
    subscribeToMore,
  } = useCommunityDiscussionListQuery({
    variables: {
      hubId: hubNameId,
      communityId: communityId || '',
    },
    errorPolicy: 'all',
    skip: !hubNameId || !communityId,
    onError: handleError,
  });

  useEffect(() => {
    if (!communicationId || !isFeatureEnabled(FEATURE_SUBSCRIPTIONS)) {
      return;
    }

    const unSubscribe = subscribeToMore<
      CommunicationDiscussionUpdatedSubscription,
      SubscriptionCommunicationDiscussionUpdatedArgs
    >({
      document: CommunicationDiscussionUpdatedDocument,
      variables: { communicationID: communicationId },
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      updateQuery: (prev, { subscriptionData }) => {
        const discussions = prev?.hub?.community?.communication?.discussions;

        if (!discussions) {
          return prev;
        }

        const updatedDiscussion = subscriptionData.data.communicationDiscussionUpdated;
        const discussionIndex = discussions.findIndex(x => x.id === updatedDiscussion.id);

        const updatedDiscussions = [...discussions];

        if (discussionIndex === -1) {
          updatedDiscussions.push(updatedDiscussion);
        } else {
          updatedDiscussions[discussionIndex] = { ...updatedDiscussion };
        }

        return merge({}, prev, {
          hub: {
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
  }, [isFeatureEnabled, subscribeToMore, communicationId]);

  const discussions = data?.hub.community?.communication?.discussions || [];

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
        data?.hub.community?.communication?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Create) ||
        false,
    }),
    [data]
  );

  const [createDiscussion, { loading: creatingDiscussion }] = useCreateDiscussionMutation({
    onCompleted: data => navigate(buildDiscussionUrl(pathname, data.createDiscussion.id), { replace: true }),
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        hubId: hubNameId,
      }),
    ],
  });

  const [deleteDiscussion, { loading: deletingDiscussion }] = useDeleteDiscussionMutation({
    onCompleted: () => navigate(buildDiscussionsUrl(pathname)),
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        hubId: hubNameId,
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
        loading: loadingHub || loadingCommunity || loadingDiscussionList || loadingAuthors,
        posting: creatingDiscussion,
        deleting: deletingDiscussion,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

const useDiscussionsContext = () => {
  const context = useContext(DiscussionsContext);

  if (!context) {
    throw new Error('Discussion context not found');
  }

  return useContext(DiscussionsContext);
};

export { DiscussionsProvider, DiscussionsContext, useDiscussionsContext };
