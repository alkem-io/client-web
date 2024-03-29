import { useState } from 'react';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import WhiteboardView from '../../whiteboard/WhiteboardsManagement/WhiteboardView';
import WhiteboardPreview from '../../whiteboard/whiteboardPreview/WhiteboardPreview';

interface SingleWhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const SingleWhiteboardCallout = ({
  callout,
  loading,
  journeyTypeName,
  contributionsCount,
  onExpand,
  onClose,
  expanded,
  ...calloutLayoutProps
}: SingleWhiteboardCalloutProps) => {
  const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
  const handleCloseWhiteboardDialog = () => {
    onClose?.();
    setIsWhiteboardDialogOpen(false);
  };

  if (!callout.framing.whiteboard) {
    return null;
  }

  return (
    <CalloutLayout
      callout={callout}
      contributionsCount={contributionsCount}
      {...calloutLayoutProps}
      expanded={expanded}
      onExpand={onExpand}
      onClose={onClose}
      journeyTypeName={journeyTypeName}
    >
      <WhiteboardPreview
        whiteboard={callout.framing.whiteboard}
        displayName={callout.framing.profile.displayName}
        onClick={() => setIsWhiteboardDialogOpen(true)}
      />
      {isWhiteboardDialogOpen && (
        <WhiteboardView
          whiteboardId={callout.framing.whiteboard?.id}
          backToWhiteboards={handleCloseWhiteboardDialog}
          journeyTypeName={journeyTypeName}
          whiteboardShareUrl={callout.framing.profile.url}
          readOnlyDisplayName
          displayName={callout.framing.profile.displayName}
          preventWhiteboardDeletion
          whiteboard={callout.framing.whiteboard}
          authorization={callout.framing.whiteboard.authorization}
          loadingWhiteboards={false}
        />
      )}
    </CalloutLayout>
  );
};

export default SingleWhiteboardCallout;
