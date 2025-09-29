import WhiteboardView from '../../whiteboard/WhiteboardsManagement/WhiteboardView';
import { CalloutContributionPreviewDialogProps } from '../calloutContributionPreview/CalloutContributionPreview';
import { WhiteboardProvider } from '../../whiteboard/containers/WhiteboardProvider';

export interface CalloutContributionDialogWhiteboardProps extends CalloutContributionPreviewDialogProps {
}

const CalloutContributionDialogWhiteboard = ({ open, onClose }: CalloutContributionDialogWhiteboardProps) => {
  if (!open) {
    return null;
  }
  return (
    <WhiteboardProvider>
      {(entities, state) => (
        <WhiteboardView
          whiteboardId={entities.whiteboard?.id}
          backToWhiteboards={onClose}
          whiteboardShareUrl={entities.whiteboard?.profile.url ?? ''}
          whiteboard={entities.whiteboard}
          authorization={entities.whiteboard?.authorization}
          loadingWhiteboards={state.loadingWhiteboards}
        />
      )}
    </WhiteboardProvider>
  );
};

export default CalloutContributionDialogWhiteboard;
