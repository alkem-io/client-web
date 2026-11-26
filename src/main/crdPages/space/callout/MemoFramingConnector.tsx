import { FileSignature } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CalloutMemoPreview } from '@/crd/components/callout/CalloutMemoPreview';
import { Button } from '@/crd/primitives/button';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';

type MemoFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
  onOpen: () => void;
  onOpenSignedCopies?: (memoId: string) => void;
};

/**
 * Renders the inline memo framing preview inside a PostCard / CalloutDetailDialog.
 * Fetches the memo markdown to populate the preview. The memo dialog itself
 * is rendered as a sibling of CalloutDetailDialog by CalloutDetailDialogConnector
 * — keeping both Radix dialogs' FocusScopes independent avoids the nested-dialog
 * pointer-events / focus-trap issue.
 */
export function MemoFramingConnector({ callout, onOpen, onOpenSignedCopies }: MemoFramingConnectorProps) {
  const { t } = useTranslation('crd-space');
  const memoId = callout.framing.memo?.id;

  if (!callout.framing.memo) {
    return null;
  }

  // The memo's text is the post's document snapshot (021 F087); its attestations are not served yet.
  const content = callout.framing.memo.markdown ?? '';
  const signatures = callout.framing.memo.signatures ?? [];
  const signedCopiesCount = signatures.filter(signature => signature.document).length;

  return (
    <div className="space-y-2">
      <CalloutMemoPreview content={content} onOpen={onOpen} />
      {signedCopiesCount > 0 && onOpenSignedCopies && memoId && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => onOpenSignedCopies(memoId)}
          >
            <FileSignature aria-hidden="true" />
            {t('memo.signing.signedCopiesCount', { count: signedCopiesCount })}
          </Button>
        </div>
      )}
    </div>
  );
}
