import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAddReactionToCalloutMutation,
  useCalloutWhoReactedLazyQuery,
  useRemoveReactionFromCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { CalloutReactionsBar } from '@/crd/components/reactions/CalloutReactionsBar';
import type { WhoReactedRow } from '@/crd/components/reactions/WhoReactedPopover';
import type { CalloutReactionsSummaryModel } from '@/domain/collaboration/callout/models/CalloutDetailsModel';

type CalloutReactionsConnectorProps = {
  calloutId: string;
  /** The callout's current reactions summary. Provided by the parent query
   *  (CalloutDetails fragment). When undefined the bar is not rendered — the
   *  server module may not yet be deployed. */
  reactionsSummary?: CalloutReactionsSummaryModel | null;
  /** The callout's authorization privileges for the current viewer */
  myPrivileges?: string[];
  /**
   * Whether the callout is published. Must be true for reactions to be
   * allowed — draft and template callouts reject reactions server-side as
   * well, so this is defense in depth on the client.
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
  // The total pill (lazily-loaded `crd-reactions` namespace) only mounts once the total is
  // > 0 — for a viewer who can't react, that can be a later refetch, and suspending then
  // would swap the rendered card for its skeleton. Load the namespace at mount instead.
  useTranslation('crd-reactions');

  // CONTRIBUTE permission + published callout required to react
  const canReact = isPublished && myPrivileges.includes(AuthorizationPrivilege.Contribute);

  const [addReaction] = useAddReactionToCalloutMutation();
  const [removeReaction] = useRemoveReactionFromCalloutMutation();
  const [fetchWhoReacted] = useCalloutWhoReactedLazyQuery({ fetchPolicy: 'network-only' });

  // The server module may not be deployed yet (wave-2-before-wave-1 scenario).
  // Render nothing when the summary field is absent to avoid breaking the feed.
  if (reactionsSummary === undefined || reactionsSummary === null) return null;

  // The global Apollo error link surfaces the user-facing message; the local
  // catch keeps the rejected promise from going unhandled and records it.
  const handleAdd = (slug: string) => {
    addReaction({
      variables: { reactionData: { calloutID: calloutId, emoji: slug } },
    }).catch(err => logError(new Error('Add callout reaction failed', { cause: err as Error })));
  };

  const handleRemove = () => {
    removeReaction({
      variables: { reactionData: { calloutID: calloutId } },
    }).catch(err => logError(new Error('Remove callout reaction failed', { cause: err as Error })));
  };

  const handleLoadWhoReacted = () => {
    void fetchWhoReacted({ variables: { calloutId } }).then(result => {
      const rows = result.data?.lookup?.callout?.reactions ?? [];
      setWhoReactedRows(
        rows.map(row => ({
          id: row.id,
          emoji: row.emoji,
          updatedDate: row.updatedDate instanceof Date ? row.updatedDate.toISOString() : String(row.updatedDate),
          user: row.user
            ? {
                displayName: row.user.profile?.displayName ?? '',
                avatarUrl: row.user.profile?.avatar?.uri,
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
