import ensurePresence from '../../../../core/utils/ensurePresence';
import {
  MessageDetailsFragmentDoc,
  useAskVirtualContributorQuestionLazyQuery,
  useMentionableUsersQuery,
  useReplyToMessageMutation,
  useSendMessageToRoomMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useCookies } from 'react-cookie';
import {
  ALKEMIO_COOKIE_PROMPT1,
  ALKEMIO_COOKIE_PROMPT2,
  ALKEMIO_COOKIE_PROMPT3,
} from '../../../platform/admin/ai/AISettingsPage';
import { compact, uniqueId } from 'lodash';
import { MentionableUsersQuery, MessageDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

interface UsePostMessageMutationsOptions {
  roomId: string | undefined;
  isSubscribedToMessages: boolean;
}

const usePostMessageMutations = ({ roomId, isSubscribedToMessages }: UsePostMessageMutationsOptions) => {
  const { spaceNameId } = useUrlParams();
  const [cookies] = useCookies([ALKEMIO_COOKIE_PROMPT1, ALKEMIO_COOKIE_PROMPT2, ALKEMIO_COOKIE_PROMPT3]);

  const { data: virtualContributorsData } = useMentionableUsersQuery({
    variables: {
      filter: {
        displayName: 'VirtualContributor',
      },
      first: 100,
    },
  });
  const virtualContributors = useMemo(() => {
    if (!virtualContributorsData) {
      return {};
    }
    const users = compact(
      virtualContributorsData?.usersPaginated.users.map(user => {
        const match = user.profile.displayName.match(/^VirtualContributor ?([\d])/);
        if (match) {
          return {
            virtualContributorNumber: match[1],
            ...user,
          };
        }
        return undefined; // Will be removed by lodash.compact
      })
    );
    // Convert the array of users into a Record
    const result = users.reduce((record, user) => {
      record[user.virtualContributorNumber] = user;
      return record;
    }, {} as Record<string, MentionableUsersQuery['usersPaginated']['users'][0]>);

    console.log('Available virtual contributors', result);
    return result;
  }, [virtualContributorsData]);

  const [postMessage, { loading: postingMessage }] = useSendMessageToRoomMutation();
  const [postReply, { loading: postingReply }] = useReplyToMessageMutation();
  const [askVirtualContributor, { loading: askingVirtualContributor }] = useAskVirtualContributorQuestionLazyQuery();

  const handleVirtualContributorTag = async (message: string, threadId?: string): Promise<MessageDetailsFragment | undefined> => {
    // Regular expression to match [@VirtualContributor n] pattern
    const match = message.match(/\[@VirtualContributor (\d+)/);

    if (match) {
      const vc = parseInt(match[1], 10); // The number n
      const prompt = cookies[`prompt${vc}`];
      const virtualContributor = virtualContributors[vc];

      if (prompt && virtualContributor) {
        const { data } = await askVirtualContributor({
          variables: {
            prompt,
            question: message,
            // spaceId: spaceNameId,
            // roomId,
          },
        });
        if (data?.askVirtualContributorQuestion) {
          return {
            __typename: 'Message',
            id: uniqueId(), //data?.askVirtualContributorQuestion.id ?? ,
            message: data?.askVirtualContributorQuestion.answer,
            timestamp: new Date(Date.now() + 5000).getTime(),
            sender: virtualContributor,
            reactions: [],
            threadID: threadId ?? null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any; // TODO! threadId cannot be undefined because of Apollo cache error and cannot be null because a typescript error :(
        }
      }
    }
    return undefined;
  }

  const handlePostMessage = async (message: string) => {
    const requiredRoomId = ensurePresence(roomId);
    const vcResponse = await handleVirtualContributorTag(message);

    return await postMessage({
      variables: {
        messageData: {
          roomID: requiredRoomId,
          message,
        },
      },
      update: (cache, { data }) => {
        const cacheRoomId = cache.identify({
          id: roomId,
          __typename: 'Room',
        });

        if (!cacheRoomId) {
          return;
        }
        if (vcResponse) {
          cache.modify({
            id: cacheRoomId,
            fields: {
              messages(existingMessages = []) {
                if (!data) {
                  return existingMessages;
                }
                const newMessage = cache.writeFragment({
                  id: `Message:${vcResponse!.id}`,
                  data: vcResponse,
                  fragment: MessageDetailsFragmentDoc,
                  fragmentName: 'MessageDetails',
                });
                return [...existingMessages, newMessage];
              },
            },
          });
        }

        if (isSubscribedToMessages) {
          return;
        }

        cache.modify({
          id: cacheRoomId,
          fields: {
            messages(existingMessages = []) {
              if (!data) {
                return existingMessages;
              }

              const newMessage = cache.writeFragment({
                data: data?.sendMessageToRoom,
                fragment: MessageDetailsFragmentDoc,
                fragmentName: 'MessageDetails',
              });
              return [...existingMessages, newMessage];
            },
          },
        });
      },
    });
  };

  const handleReply = async ({ threadId, messageText }: { threadId: string; messageText: string }) => {
    const requiredRoomId = ensurePresence(roomId);
    const vcResponse = await handleVirtualContributorTag(messageText, threadId);

    return postReply({
      variables: {
        roomId: requiredRoomId,
        message: messageText,
        threadId,
      },
      update: (cache, { data }) => {
        const cacheRoomId = cache.identify({
          id: roomId,
          __typename: 'Room',
        });

        if (!cacheRoomId) {
          return;
        }
        if (vcResponse) {
          cache.modify({
            id: cacheRoomId,
            fields: {
              messages(existingMessages = []) {
                if (!data) {
                  return existingMessages;
                }
                const newMessage = cache.writeFragment({
                  id: `Message:${vcResponse!.id}`,
                  data: vcResponse,
                  fragment: MessageDetailsFragmentDoc,
                  fragmentName: 'MessageDetails',
                });
                return [...existingMessages, newMessage];
              },
            },
          });
        }

        if (isSubscribedToMessages) {
          return;
        }

        cache.modify({
          id: cacheRoomId,
          fields: {
            messages(existingMessages = []) {
              if (!data) {
                return existingMessages;
              }

              const newMessage = cache.writeFragment({
                data: data?.sendMessageReplyToRoom,
                fragment: MessageDetailsFragmentDoc,
                fragmentName: 'MessageDetails',
              });
              return [...existingMessages, newMessage];
            },
          },
        });
      },
    });
  };

  return {
    postMessage: handlePostMessage,
    postReply: handleReply,
    postingMessage: postingMessage || askingVirtualContributor,
    postingReply: postingReply || askingVirtualContributor,
  };
};

export default usePostMessageMutations;
