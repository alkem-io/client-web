/**
 * Shared types and utilities for user messaging
 */

// Message sender type used across messaging components
export interface MessageSender {
  id: string;
  displayName: string;
  avatarUri?: string;
}

// Message type used for conversation messages
export interface ConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: MessageSender;
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
