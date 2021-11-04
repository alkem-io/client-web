import { uniq } from 'lodash';
import React, { FC, useCallback, useContext, useMemo } from 'react';
import { useEcoverse } from '../../hooks';
import { useCommunityDiscussionListQuery, useUserAvatarsQuery } from '../../hooks/generated/graphql';
import { Author } from '../../models/discussion/author';
import { Discussion } from '../../models/discussion/discussion';
import { Comment } from '../../models/discussion/comment';
import { buildUserProfileUrl } from '../../utils/urlBuilders';
import { useCommunityContext } from '../CommunityProvider';
import { MessageDetailsFragment } from '../../models/graphql-schema';

interface DiscussionContextProps {
  discussionList: Discussion[];
  getDiscussion: (id: string) => Discussion | undefined;
  loading: boolean;
}

const DiscussionsContext = React.createContext<DiscussionContextProps>({
  discussionList: [],
  getDiscussion: (_id: string) => undefined, // might be handled better;
  loading: false,
});

interface DiscussionProviderProps {}

const sortMessages = (messages: MessageDetailsFragment[] = []) => messages.sort((a, b) => a.timestamp - b.timestamp);

const DiscussionsProvider: FC<DiscussionProviderProps> = ({ children }) => {
  const { ecoverseNameId, loading: loadingEcoverse } = useEcoverse();
  const { communityId, loading: loadingCommunity } = useCommunityContext();

  const { data, loading: loadingDiscussionList } = useCommunityDiscussionListQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      communityId: communityId || '',
    },
    skip: !ecoverseNameId || !communityId,
  });

  const discussions = data?.ecoverse.community?.communication?.discussions || [];

  const senders = uniq(discussions.flatMap(d => d.messages?.map(m => m.sender) || []));

  const { data: avatarData, loading: loadingAvatars } = useUserAvatarsQuery({
    variables: { ids: senders },
    skip: senders.length === 0,
  });

  const authors = useMemo(
    () =>
      avatarData?.usersById.map<Author>(a => ({
        id: a.id,
        displayName: a.displayName,
        firstName: a.firstName,
        lastName: a.lastName,
        avatarUrl: a.profile?.avatar || '',
        url: buildUserProfileUrl(a.nameID),
      })),
    [avatarData]
  );

  const getAuthor = useCallback((senderId: string) => authors?.find(a => a.id === senderId), [authors]);
  const getAuthors = useCallback(
    (senderIds: string[]) => authors?.filter(a => senderIds.includes(a.id)) || [],
    [authors]
  );

  const discussionList = discussions.map<Discussion>(x => {
    const sortedMessages = sortMessages(x.messages);
    const firstMessage = sortedMessages[0];

    return {
      id: x.id,
      title: x.title,
      author: getAuthor(firstMessage?.sender || ''),
      authors: getAuthors(sortedMessages.map(m => m.sender)),
      description: firstMessage?.message || '',
      createdAt: firstMessage ? new Date(firstMessage.timestamp) : new Date(),
      totalComments: sortedMessages.slice(1).length,
      comments: sortedMessages.slice(1).map<Comment>(m => ({
        id: m.id,
        body: m.message,
        author: getAuthor(m.sender),
        createdAt: new Date(m.timestamp),
      })),
    };
  });

  const getDiscussion = useCallback((id: string) => discussionList.find(x => x.id === id), [discussionList]);

  return (
    <DiscussionsContext.Provider
      value={{
        discussionList,
        getDiscussion,
        loading: loadingEcoverse || loadingCommunity || loadingDiscussionList || loadingAvatars,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

const useDiscussionsContext = () => {
  return useContext(DiscussionsContext);
};

export { DiscussionsProvider, DiscussionsContext, useDiscussionsContext };
