import { useState } from 'react';
import MemoPreview from '../../memo/MemoPreview/MemoPreview';
import MemoDialog from '../../memo/MemoDialog/MemoDialog';
import { CalloutDetailsModel } from '../models/CalloutDetailsModel';
import useMemoManager from '@/domain/collaboration/memo/MemoManager/useMemoManager';

interface CalloutFramingMemoProps {
  callout: CalloutDetailsModel;
  onCollapse?: () => void;
}

const CalloutFramingMemo = ({ callout, onCollapse }: CalloutFramingMemoProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const memoId = callout.framing.memo?.id;
  const { memo, refreshMarkdown } = useMemoManager({ id: memoId });

  const handleCloseMemoDialog = () => {
    if (memoId) {
      // Refresh immediately to catch already-saved content
      void refreshMarkdown();

      // Also refresh after 2.5 seconds to catch any pending autosave
      setTimeout(() => {
        void refreshMarkdown();
      }, 2500);
    }

    onCollapse?.();
    setDialogOpen(false);
  };

  if (!callout.framing.memo) {
    return null;
  }

  // Use the memo from the query if it has markdown, otherwise use the callout's memo
  const displayMemo = memo?.markdown ? { markdown: memo.markdown } : callout.framing.memo;

  return (
    <>
      <MemoPreview
        memo={displayMemo}
        displayName={callout.framing.profile.displayName}
        onClick={() => setDialogOpen(true)}
      />
      <MemoDialog
        open={dialogOpen}
        memoId={callout.framing.memo.id}
        calloutId={callout.id}
        onClose={handleCloseMemoDialog}
      />
    </>
  );
};

export default CalloutFramingMemo;
