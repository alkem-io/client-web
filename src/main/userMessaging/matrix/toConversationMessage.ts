import type { MessageAttachment } from '@/crd/components/comment/types';
import type { ConversationMember, ConversationMessage, MessageSender } from '../models';
import { actorIdOf, type MediaRef, type ParsedMessage } from './matrixEvents';

type SenderProfile = { readonly displayName: string; readonly avatarUri?: string };

type MappingContext = {
  readonly members: readonly ConversationMember[];
  /** Profiles looked up for senders who are no longer members. */
  readonly otherProfiles: ReadonlyMap<string, SenderProfile>;
  /** Resolved attachments by event id. */
  readonly attachments: ReadonlyMap<string, MessageAttachment>;
};

const senderOf = (matrixUserId: string, context: MappingContext): MessageSender => {
  const actorId = actorIdOf(matrixUserId);
  const member = context.members.find(candidate => candidate.id === actorId);
  if (member) {
    return { id: actorId, displayName: member.displayName, avatarUri: member.avatarUri };
  }
  const profile = context.otherProfiles.get(actorId);
  return { id: actorId, displayName: profile?.displayName ?? '', avatarUri: profile?.avatarUri };
};

// Until (or unless) the server resolves it, media shows as its filename only —
// the same shape the server returns for an unavailable document.
const attachmentOf = (eventId: string, media: MediaRef, context: MappingContext): MessageAttachment =>
  context.attachments.get(eventId) ?? { displayName: media.displayName || 'attachment' };

const toConversationMessage = (message: ParsedMessage, context: MappingContext): ConversationMessage => ({
  id: message.eventId,
  message: message.body,
  timestamp: message.timestamp,
  sender: senderOf(message.sender, context),
  reactions: message.reactions.map(reaction => {
    const sender = senderOf(reaction.sender, context);
    return {
      id: reaction.eventId,
      emoji: reaction.emoji,
      timestamp: reaction.timestamp,
      sender: { id: sender.id, profile: { displayName: sender.displayName } },
    };
  }),
  attachments: message.media ? [attachmentOf(message.eventId, message.media, context)] : [],
});

/** Actor ids of senders (and reactors) who are not current members. */
const nonMemberActorIds = (messages: readonly ParsedMessage[], members: readonly ConversationMember[]): string[] => {
  const memberIds = new Set(members.map(member => member.id));
  const ids = new Set<string>();
  for (const message of messages) {
    for (const userId of [message.sender, ...message.reactions.map(reaction => reaction.sender)]) {
      const actorId = actorIdOf(userId);
      if (!memberIds.has(actorId)) {
        ids.add(actorId);
      }
    }
  }
  return [...ids];
};

export { nonMemberActorIds, toConversationMessage };
export type { MappingContext, SenderProfile };
