import { useState } from 'react';
import buildGuestShareUrl from '../../whiteboard/utils/buildGuestShareUrl';
import WhiteboardPreview from '../../whiteboard/WhiteboardPreview/WhiteboardPreview';
import WhiteboardView from '../../whiteboard/WhiteboardsManagement/WhiteboardView';
import type { CalloutDetailsModel } from '../models/CalloutDetailsModel';

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

  const guestShareUrl = buildGuestShareUrl(
    callout.framing.whiteboard.id ?? callout.framing.whiteboard.nameID ?? undefined
  );

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
          guestShareUrl={guestShareUrl}
          readOnlyDisplayName={true}
          displayName={callout.framing.profile.displayName}
          preventWhiteboardDeletion={true}
          whiteboard={callout.framing.whiteboard}
          authorization={callout.framing.whiteboard?.authorization}
          loadingWhiteboards={false}
        />
      )}
    </>
  );
};

export default CalloutFramingWhiteboard;
