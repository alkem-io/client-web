import { uniq } from 'lodash';
import React, { FC, useContext, useMemo } from 'react';
import { useNavigate, useResolvedPath } from 'react-router-dom';
import { useApolloErrorHandler, useHub } from '../../hooks';
import { useAuthorsDetails } from '../../domain/communication/useAuthorsDetails';
import {
  CommunicationDiscussionUpdatedDocument,
  refetchCommunityDiscussionListQuery,
  useCommunityDiscussionListQuery,
  useCreateDiscussionMutation,
  useDeleteDiscussionMutation,
} from '../../hooks/generated/graphql';
import { Discussion } from '../../models/discussion/discussion';
import {
  AuthorizationPrivilege,
  Communication,
  CommunicationDiscussionUpdatedSubscription,
  CommunicationDiscussionUpdatedSubscriptionVariables,
  Discussion as DiscussionGraphql,
  DiscussionCategory,
} from '../../models/graphql-schema';
import { useCommunityContext } from '../../domain/community/CommunityContext';
import { buildDiscussionsUrl, buildDiscussionUrl } from '../../utils/urlBuilders';
import UseSubscriptionToSubEntity from '../../domain/shared/subscriptions/useSubscriptionToSubEntity';

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

const useSubscriptionToCommunication = UseSubscriptionToSubEntity<
  Pick<Communication, 'id' | 'discussions'>,
  CommunicationDiscussionUpdatedSubscriptionVariables,
  CommunicationDiscussionUpdatedSubscription
>({
  subscriptionDocument: CommunicationDiscussionUpdatedDocument,
  getSubscriptionVariables: communication => ({ communicationID: communication.id }),
  updateSubEntity: (communication, subscriptionData) => {
    if (!communication?.discussions) {
      return;
    }
    const discussionIndex = communication.discussions.findIndex(
      d => d.id === subscriptionData.communicationDiscussionUpdated.id
    );
    if (discussionIndex === -1) {
      return;
    }
    communication.discussions[discussionIndex] = subscriptionData.communicationDiscussionUpdated;
  },
});

const DiscussionsProvider: FC<DiscussionProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useResolvedPath('.');
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

  useSubscriptionToCommunication(data, data1 => data1?.hub.community?.communication, subscribeToMore);

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
