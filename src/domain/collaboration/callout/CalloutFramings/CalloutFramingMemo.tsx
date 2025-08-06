import { useState } from 'react';
import MemoPreview from '../../memo/MemoPreview/MemoPreview';
import MemoDialog from '../../memo/MemoDialog/MemoDialog';
import { TypedCalloutDetails } from '../models/TypedCallout';

interface CalloutFramingMemoProps {
  callout: TypedCalloutDetails;
  onCollapse?: () => void;
}

const CalloutFramingMemo = ({ callout, onCollapse }: CalloutFramingMemoProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleCloseMemoDialog = () => {
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
      <MemoDialog open={dialogOpen} memoId={callout.framing.memo.id} onClose={handleCloseMemoDialog} />
    </>
  );
};

export default CalloutFramingMemo;
