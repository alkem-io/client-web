import { useState } from 'react';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import WhiteboardRtManagementView from '../../whiteboard/WhiteboardsManagement/WhiteboardRtManagementView';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import WhiteboardPreview from '../../whiteboard/whiteboardPreview/WhiteboardPreview';

interface SingleWhiteboardRtCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const SingleWhiteboardRtCallout = ({
  callout,
  spaceNameId,
  loading,
  challengeNameId,
  opportunityNameId,
  journeyTypeName,
  contributionsCount,
  onExpand,
  onClose,
  expanded,
  ...calloutLayoutProps
}: SingleWhiteboardRtCalloutProps) => {
  const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
  const handleCloseWhiteboardDialog = () => {
    onClose?.();
    setIsWhiteboardDialogOpen(false);
  };

  if (!callout.framing.whiteboardRt) {
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
        whiteboard={callout.framing.whiteboardRt}
        displayName={callout.framing.profile.displayName}
        onClick={() => setIsWhiteboardDialogOpen(true)}
      />
      {isWhiteboardDialogOpen && (
        <WhiteboardRtManagementView
          whiteboardId={callout.framing.whiteboardRt?.id}
          backToWhiteboards={handleCloseWhiteboardDialog}
          journeyTypeName={journeyTypeName}
          whiteboardShareUrl={buildCalloutUrl(callout.nameID, {
            spaceNameId,
            challengeNameId,
            opportunityNameId,
          })}
          readOnlyDisplayName
          whiteboard={callout.framing.whiteboardRt}
          authorization={callout.framing.whiteboardRt.authorization}
          loadingWhiteboards={false}
        />
      )}
    </CalloutLayout>
  );
};

export default SingleWhiteboardRtCallout;
