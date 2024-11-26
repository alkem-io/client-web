import { useState } from 'react';
import CalloutLayout, { CalloutLayoutProps } from '../calloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import WhiteboardView from '@/domain/collaboration/whiteboard/WhiteboardsManagement/WhiteboardView';
import WhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';

interface SingleWhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const SingleWhiteboardCallout = ({
  callout,
  loading,
  journeyTypeName,
  contributionsCount,
  onExpand,
  onCollapse,
  expanded,
  ...calloutSettingsProps
}: SingleWhiteboardCalloutProps) => {
  const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
  const handleCloseWhiteboardDialog = () => {
    onCollapse?.();
    setIsWhiteboardDialogOpen(false);
  };

  if (!callout.framing.whiteboard) {
    return null;
  }

  return (
    <CalloutSettingsContainer
      callout={callout}
      expanded={expanded}
      onExpand={onExpand}
      journeyTypeName={journeyTypeName}
      {...calloutSettingsProps}
    >
      {calloutSettingsProvided => (
        <CalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutSettingsProvided}
          expanded={expanded}
          onExpand={onExpand}
          onCollapse={onCollapse}
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
              authorization={callout.framing.whiteboard?.authorization}
              loadingWhiteboards={false}
            />
          )}
        </CalloutLayout>
      )}
    </CalloutSettingsContainer>
  );
};

export default SingleWhiteboardCallout;
