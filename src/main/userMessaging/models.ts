/**
 * Shared types and utilities for user messaging
 */

// Message sender type used across messaging components
export interface MessageSender {
  id: string;
  displayName: string;
  avatarUri?: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  timestamp: number;
  sender?: {
    id: string;
    profile: {
      displayName: string;
    };
  };
}

// Message type used for conversation messages
export interface ConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: MessageSender;
  reactions: MessageReaction[];
}

// GraphQL sender type (from generated types)
type GraphQLSender =
  | { __typename?: 'Organization' }
  | {
      __typename?: 'User';
      id: string;
      profile?: {
        displayName?: string;
        avatar?: { uri: string } | null;
      } | null;
    }
  | {
      __typename?: 'VirtualContributor';
      id: string;
      profile?: {
        displayName?: string;
        avatar?: { uri: string } | null;
      } | null;
    }
  | null
  | undefined;

type GraphQLReaction =
  | {
      id: string;
      emoji: string;
      timestamp: number;
      sender?: {
        id: string;
        profile?: {
          displayName?: string;
        } | null;
      } | null;
    }
  | null
  | undefined;

/**
 * Maps a GraphQL message sender to our simplified MessageSender type.
 * Supports User and VirtualContributor senders.
 */
export const mapMessageSender = (sender: GraphQLSender): MessageSender | undefined => {
  if (!sender) {
    return undefined;
  }

  if (sender.__typename === 'User' || sender.__typename === 'VirtualContributor') {
    return {
      id: sender.id,
      displayName: sender.profile?.displayName ?? '',
      avatarUri: sender.profile?.avatar?.uri,
    };
  }

  return undefined;
};

export const mapMessageReactions = (reactions: GraphQLReaction[] | null | undefined): MessageReaction[] => {
  if (!reactions?.length) {
    return [];
  }

  return reactions
    .filter((reaction): reaction is NonNullable<GraphQLReaction> => Boolean(reaction?.id && reaction?.emoji))
    .map(reaction => ({
      id: reaction.id,
      emoji: reaction.emoji,
      timestamp: reaction.timestamp ?? 0,
      sender: reaction.sender
        ? {
            id: reaction.sender.id,
            profile: {
              displayName: reaction.sender.profile?.displayName ?? '',
            },
          }
        : undefined,
    }));
};
