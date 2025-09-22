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
  const { refreshMarkdown } = useMemoManager({ id: callout.framing.memo?.id });

  const handleCloseMemoDialog = () => {
    if (callout.framing.memo?.id) {
      refreshMarkdown();
    }

    onCollapse?.();
    setDialogOpen(false);
  };

  if (!callout.framing.memo) {
    return null;
  }

  return (
    <>
      <MemoPreview
        memo={callout.framing.memo}
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
