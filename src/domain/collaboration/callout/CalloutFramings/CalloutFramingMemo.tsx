import { useState } from 'react';
import MemoPreview from '../../memo/MemoPreview/MemoPreview';
import MemoDialog from '../../memo/MemoDialog/MemoDialog';
import { TypedCalloutDetails } from '../models/TypedCallout';

interface CalloutFramingMemoProps {
  callout: TypedCalloutDetails;
  onCollapse?: () => void;
}

const CalloutFramingMemo = ({ callout, onCollapse }: CalloutFramingMemoProps) => {
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);
  const handleCloseMemoDialog = () => {
    onCollapse?.();
    setIsMemoDialogOpen(false);
  };

  if (!callout.framing.memo) {
    return null;
  }

  return (
    <>
      <MemoPreview
        memo={callout.framing.memo}
        displayName={callout.framing.profile.displayName}
        onClick={() => setIsMemoDialogOpen(true)}
      />
      {isMemoDialogOpen && (
        <MemoDialog memoId={callout.framing.memo.id} onClose={handleCloseMemoDialog} preventMemoDeletion />
      )}
    </>
  );
};

export default CalloutFramingMemo;
