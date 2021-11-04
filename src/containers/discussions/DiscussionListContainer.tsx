import { uniq } from 'lodash';
import React, { FC, useCallback, useMemo } from 'react';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useEcoverse } from '../../hooks';
import { useCommunityDiscussionListQuery, useUserAvatarsQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Author } from '../../models/discussion/author';
import { Comment } from '../../models/discussion/comment';
import { Discussion } from '../../models/discussion/discussion';
import { MessageDetailsFragment } from '../../models/graphql-schema';
import { buildUserProfileUrl } from '../../utils/urlBuilders';

export interface DiscussionListEntities {
  discussionList: Discussion[];
}
export interface DiscussionListState {
  loading: boolean;
}
export interface DiscussionListActions {}

export interface DiscussionListContainerProps
  extends ContainerProps<DiscussionListEntities, DiscussionListActions, DiscussionListState> {}

const sortMessages = (messages: MessageDetailsFragment[] = []) => messages.sort((a, b) => a.timestamp - b.timestamp);

const DiscussionListContainer: FC<DiscussionListContainerProps> = ({ children }) => {
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

  return (
    <>
      {children(
        {
          discussionList,
        },
        {
          loading: loadingEcoverse || loadingCommunity || loadingDiscussionList || loadingAvatars,
        },
        {}
      )}
    </>
  );
};
export default DiscussionListContainer;
