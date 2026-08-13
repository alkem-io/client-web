import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { CalloutReactionsBar } from '@/crd/components/reactions/CalloutReactionsBar';
import type { WhoReactedRow } from '@/crd/components/reactions/WhoReactedPopover';
import type {
  AddReactionToCalloutInput,
  CalloutReactionsSummaryFragment,
  CalloutWhoReactedRow,
  RemoveReactionFromCalloutInput,
} from './CalloutReactionsTypes';

// GraphQL documents — built against the expected wave-1 server schema.
// When codegen runs against the deployed server, these inline documents can
// be replaced with the generated hooks from apollo-hooks.ts.

const ADD_REACTION_MUTATION = gql`
  mutation AddReactionToCallout($reactionData: AddReactionToCalloutInput!) {
    addReactionToCallout(reactionData: $reactionData) {
      id
      reactionsSummary {
        total
        emojis
        myReactionEmoji
        allowedEmojis
      }
    }
  }
`;

const REMOVE_REACTION_MUTATION = gql`
  mutation RemoveReactionFromCallout($reactionData: RemoveReactionFromCalloutInput!) {
    removeReactionFromCallout(reactionData: $reactionData) {
      id
      reactionsSummary {
        total
        emojis
        myReactionEmoji
        allowedEmojis
      }
    }
  }
`;

const WHO_REACTED_QUERY = gql`
  query CalloutWhoReacted($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
        reactions {
          id
          emoji
          updatedDate
          user {
            id
            profile {
              id
              displayName
              avatar: visual(type: AVATAR) {
                id
                uri
              }
            }
          }
        }
      }
    }
  }
`;

type CalloutReactionsConnectorProps = {
  calloutId: string;
  /** The callout's current reactions summary. Provided by the parent query
   *  (CalloutDetails fragment). When undefined the bar is not rendered — the
   *  server module may not yet be deployed. */
  reactionsSummary?: CalloutReactionsSummaryFragment | null;
  /** The callout's authorization privileges for the current viewer */
  myPrivileges?: string[];
  /**
   * Whether the callout is published. Must be true for reactions to be
   * allowed — draft and template callouts reject reactions server-side as
   * well, so this is defense in depth on the client (FR-010).
   */
  isPublished: boolean;
};

/**
 * Apollo wiring layer for callout emoji reactions.
 * Feeds the props-only CalloutReactionsBar from the Apollo cache and fires
 * add/remove mutations. Who-reacted rows are fetched lazily on first open.
 *
 * Zero Matrix/roomId references — this is an entirely separate data path.
 */
export function CalloutReactionsConnector({
  calloutId,
  reactionsSummary,
  myPrivileges = [],
  isPublished,
}: CalloutReactionsConnectorProps) {
  const [whoReactedRows, setWhoReactedRows] = useState<WhoReactedRow[]>([]);

  // CONTRIBUTE permission + published callout required to react (FR-009, FR-010)
  const canReact = isPublished && myPrivileges.includes(AuthorizationPrivilege.Contribute);

  const [addReaction] = useMutation<
    { addReactionToCallout: { id: string; reactionsSummary: CalloutReactionsSummaryFragment } },
    { reactionData: AddReactionToCalloutInput }
  >(ADD_REACTION_MUTATION);

  const [removeReaction] = useMutation<
    { removeReactionFromCallout: { id: string; reactionsSummary: CalloutReactionsSummaryFragment } },
    { reactionData: RemoveReactionFromCalloutInput }
  >(REMOVE_REACTION_MUTATION);

  const [fetchWhoReacted] = useLazyQuery<
    { lookup: { callout?: { id: string; reactions: CalloutWhoReactedRow[] } | null } },
    { calloutId: string }
  >(WHO_REACTED_QUERY, { fetchPolicy: 'network-only' });

  // The server module may not be deployed yet (wave-2-before-wave-1 scenario).
  // Render nothing when the summary field is absent to avoid breaking the feed.
  if (reactionsSummary === undefined || reactionsSummary === null) return null;

  const handleAdd = (slug: string) => {
    void addReaction({
      variables: { reactionData: { calloutID: calloutId, emoji: slug } },
    });
  };

  const handleRemove = () => {
    void removeReaction({
      variables: { reactionData: { calloutID: calloutId } },
    });
  };

  const handleLoadWhoReacted = () => {
    void fetchWhoReacted({ variables: { calloutId } }).then(result => {
      const rows = result.data?.lookup?.callout?.reactions ?? [];
      setWhoReactedRows(
        rows.map(row => ({
          id: row.id,
          emoji: row.emoji,
          updatedDate: row.updatedDate,
          user: row.user
            ? {
                displayName: row.user.profile.displayName,
                avatarUrl: row.user.profile.avatar?.uri,
              }
            : null,
        }))
      );
    });
  };

  return (
    <CalloutReactionsBar
      summary={reactionsSummary}
      canReact={canReact}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onLoadWhoReacted={handleLoadWhoReacted}
      whoReactedRows={whoReactedRows}
    />
  );
}
