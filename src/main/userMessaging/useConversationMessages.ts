import { nonMemberActorIds, toConversationMessage } from './matrix/toConversationMessage';
import { useActorProfiles } from './matrix/useActorProfiles';
import { useConversationTimeline } from './matrix/useConversationTimeline';
import type { ConversationMember } from './models';
import { useAttachmentReadiness } from './useAttachmentReadiness';

export type { ConversationMessage } from './models';

type ConversationRef = {
  readonly id: string;
  readonly roomId: string;
  readonly attachmentBucketId?: string | null;
  readonly members: readonly ConversationMember[];
};

/** The open conversation's messages, read from the browser's Matrix sync. */
export const useConversationMessages = (conversation: ConversationRef | null) => {
  const { messages: parsed, readUpToEventId, isLoading } = useConversationTimeline(conversation?.roomId ?? null);
  const members = conversation?.members ?? [];
  const otherProfiles = useActorProfiles(nonMemberActorIds(parsed, members));

  const messages = parsed
    .map(message =>
      toConversationMessage(message, { members, otherProfiles, attachmentBucketId: conversation?.attachmentBucketId })
    )
    .sort((a, b) => a.timestamp - b.timestamp);
  const readyMessages = useAttachmentReadiness(messages, conversation?.roomId);

  return {
    messages: readyMessages,
    readUpToEventId,
    roomId: conversation?.roomId ?? null,
    isLoading,
  };
};
