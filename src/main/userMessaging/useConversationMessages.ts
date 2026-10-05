import { nonMemberActorIds, toConversationMessage } from './matrix/toConversationMessage';
import { useActorProfiles } from './matrix/useActorProfiles';
import { useConversationTimeline } from './matrix/useConversationTimeline';
import { useMessageAttachments } from './matrix/useMessageAttachments';
import type { ConversationMember } from './models';

export type { ConversationMessage } from './models';

type ConversationRef = {
  readonly id: string;
  readonly roomId: string;
  readonly members: readonly ConversationMember[];
};

/** The open conversation's messages, read from the browser's Matrix sync. */
export const useConversationMessages = (conversation: ConversationRef | null) => {
  const { messages: parsed, readUpToEventId, isLoading } = useConversationTimeline(conversation?.roomId ?? null);
  const members = conversation?.members ?? [];
  const attachments = useMessageAttachments(conversation?.id, parsed);
  const otherProfiles = useActorProfiles(nonMemberActorIds(parsed, members));

  const messages = parsed
    .map(message => toConversationMessage(message, { members, otherProfiles, attachments }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return {
    messages,
    readUpToEventId,
    roomId: conversation?.roomId ?? null,
    isLoading,
  };
};
