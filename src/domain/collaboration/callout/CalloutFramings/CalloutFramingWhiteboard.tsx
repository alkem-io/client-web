import { useState } from 'react';
import WhiteboardPreview from '../../whiteboard/WhiteboardPreview/WhiteboardPreview';
import WhiteboardView from '../../whiteboard/WhiteboardsManagement/WhiteboardView';
import { CalloutDetailsModel } from '../models/CalloutDetailsModel';

interface CalloutFramingWhiteboardProps {
  callout: CalloutDetailsModel;
  onCollapse?: () => void;
}

const CalloutFramingWhiteboard = ({ callout, onCollapse }: CalloutFramingWhiteboardProps) => {
  const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
  const handleCloseWhiteboardDialog = () => {
    onCollapse?.();
    setIsWhiteboardDialogOpen(false);
  };

  if (!callout.framing.whiteboard) {
    return null;
  }

  return (
    <>
      <WhiteboardPreview
        whiteboard={callout.framing.whiteboard}
        displayName={callout.framing.profile.displayName}
        onClick={() => setIsWhiteboardDialogOpen(true)}
      />
      {isWhiteboardDialogOpen && (
        <WhiteboardView
          whiteboardId={callout.framing.whiteboard?.id}
          backToWhiteboards={handleCloseWhiteboardDialog}
          whiteboardShareUrl={callout.framing.profile.url}
          readOnlyDisplayName
          displayName={callout.framing.profile.displayName}
          preventWhiteboardDeletion
          whiteboard={callout.framing.whiteboard}
          authorization={callout.framing.whiteboard?.authorization}
          loadingWhiteboards={false}
        />
      )}
    </>
  );
};

export default CalloutFramingWhiteboard;
