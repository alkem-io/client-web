import {
  type ConversationMember,
  type ConversationMessage,
  type MessageSender,
  mapMessageAttachments,
} from '../models';
import { actorIdOf, type ParsedMessage } from './matrixEvents';

type SenderProfile = { readonly displayName: string; readonly avatarUri?: string };

type MappingContext = {
  readonly members: readonly ConversationMember[];
  /** Profiles looked up for senders who are no longer members. */
  readonly otherProfiles: ReadonlyMap<string, SenderProfile>;
  readonly attachmentBucketId?: string | null;
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
  attachments: mapMessageAttachments(message.media ? [message.media] : [], context.attachmentBucketId),
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
