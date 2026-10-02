import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';
import { RoomMessageAttachmentsDocument } from '@/core/apollo/generated/apollo-hooks';
import type {
  RoomMessageAttachmentsQuery,
  RoomMessageAttachmentsQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
import type { MessageAttachment } from '@/crd/components/comment/types';
import { mapMessageAttachments } from '../models';
import type { ParsedMessage } from './matrixEvents';

// The server resolves at most this many media events per call.
const MAX_MEDIA_PER_CALL = 100;

type Resolvable = { readonly eventId: string; readonly media: NonNullable<ParsedMessage['media']> };

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

/**
 * Resolves the attachments of media events read from sync through the
 * server, which keeps authorizing and describing the stored documents exactly
 * as it does for its own message history. Keyed by event id.
 */
const useMessageAttachments = (
  conversationId: string | undefined,
  messages: readonly ParsedMessage[]
): ReadonlyMap<string, MessageAttachment> => {
  const client = useApolloClient();
  const [resolved, setResolved] = useState<ReadonlyMap<string, MessageAttachment>>(new Map());
  // Events whose call is in flight; a later timeline change must not re-send them.
  const [requested] = useState(() => new Set<string>());
  // Events whose call failed, with the timeline they failed on; they are retried
  // when the conversation's media changes, not on unrelated re-renders. State, so
  // a failure that lands after the media already changed re-renders and retries.
  const [failed, setFailed] = useState<ReadonlyMap<string, string>>(new Map());

  const resolvable: Resolvable[] = messages.flatMap(message =>
    message.media?.mediaID ? [{ eventId: message.eventId, media: message.media }] : []
  );
  const timelineKey = `${conversationId}|${resolvable.map(item => item.eventId).join(',')}`;
  const pendingKey = resolvable
    .filter(
      item => !resolved.has(item.eventId) && !requested.has(item.eventId) && failed.get(item.eventId) !== timelineKey
    )
    .map(item => item.eventId)
    .join(',');

  useEffect(() => {
    if (!conversationId || pendingKey === '') {
      return;
    }
    const pendingIds = new Set(pendingKey.split(','));
    const pending = resolvable.filter(item => pendingIds.has(item.eventId));

    for (const batch of chunk(pending, MAX_MEDIA_PER_CALL)) {
      for (const item of batch) {
        requested.add(item.eventId);
      }
      client
        .query<RoomMessageAttachmentsQuery, RoomMessageAttachmentsQueryVariables>({
          query: RoomMessageAttachmentsDocument,
          variables: {
            conversationId,
            media: batch.map(({ media }) => ({
              mediaID: media.mediaID as string,
              displayName: media.displayName,
              documentID: media.documentID,
              width: media.width,
              height: media.height,
            })),
          },
        })
        .then(({ data }) => {
          const attachments = mapMessageAttachments(data?.lookup?.conversation?.room?.messageAttachments);
          if (attachments.length !== batch.length) {
            throw new Error('attachment count mismatch');
          }
          setResolved(previous => {
            const next = new Map(previous);
            batch.forEach((item, index) => {
              next.set(item.eventId, attachments[index]);
            });
            return next;
          });
        })
        .catch(() => {
          // Stays filename-only; the next change in the conversation retries.
          for (const item of batch) {
            requested.delete(item.eventId);
          }
          setFailed(previous => {
            const next = new Map(previous);
            for (const item of batch) {
              next.set(item.eventId, timelineKey);
            }
            return next;
          });
        });
    }
    // Results are keyed by event id, so a response arriving after the
    // conversation changed is still correct to keep.
    // `resolvable` is derived from `messages`; `pendingKey` carries the part that matters.
  }, [client, conversationId, pendingKey, requested, timelineKey]);

  return resolved;
};

export { useMessageAttachments };
