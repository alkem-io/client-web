import { CalloutMemoPreview } from '@/crd/components/callout/CalloutMemoPreview';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useMemoManager from '@/domain/collaboration/memo/MemoManager/useMemoManager';

type MemoFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onOpen: () => void;
};

/**
 * Renders the inline memo framing preview inside a PostCard / CalloutDetailDialog.
 * Fetches the memo markdown to populate the preview. The memo dialog itself
 * is rendered as a sibling of CalloutDetailDialog by CalloutDetailDialogConnector
 * — keeping both Radix dialogs' FocusScopes independent avoids the nested-dialog
 * pointer-events / focus-trap issue.
 */
export function MemoFramingConnector({ callout, onOpen }: MemoFramingConnectorProps) {
  const memoId = callout.framing.memo?.id;
  const { memo } = useMemoManager({ id: memoId });

  if (!callout.framing.memo) {
    return null;
  }

  const content = memo?.markdown ?? callout.framing.memo.markdown ?? '';

  return <CalloutMemoPreview content={content} onOpen={onOpen} />;
}
