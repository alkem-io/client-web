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
  | { __typename?: 'VirtualContributor' }
  | null
  | undefined;

/**
 * Maps a GraphQL message sender to our simplified MessageSender type.
 * Only User senders are supported; others return undefined.
 */
export const mapMessageSender = (sender: GraphQLSender): MessageSender | undefined => {
  if (!sender || sender.__typename !== 'User') {
    return undefined;
  }

  return {
    id: sender.id,
    displayName: sender.profile?.displayName ?? '',
    avatarUri: sender.profile?.avatar?.uri,
  };
};
