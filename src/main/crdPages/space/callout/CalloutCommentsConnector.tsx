import { CalloutComments } from '@/crd/components/callout/CalloutComments';

type CalloutCommentsConnectorProps = {
  calloutId: string;
  commentsEnabled: boolean;
};

/**
 * Fetches comment data for a callout and wires add/reply mutations.
 * Uses existing comment hooks from the domain layer.
 */

export function CalloutCommentsConnector({ calloutId: _calloutId, commentsEnabled }: CalloutCommentsConnectorProps) {
  if (!commentsEnabled) return null;

  // TODO: Wire to useRoomComments or similar existing hook
  // For now, render empty comments section
  const handleAddComment = (_content: string) => {
    // TODO: Call addComment mutation
  };

  const handleReply = (_parentId: string, _content: string) => {
    // TODO: Call addReply mutation
  };

  return <CalloutComments comments={[]} canComment={true} onAddComment={handleAddComment} onReply={handleReply} />;
}
