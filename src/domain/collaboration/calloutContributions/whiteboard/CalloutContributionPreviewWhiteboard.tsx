import WhiteboardPreview from '../../whiteboard/WhiteboardPreview/WhiteboardPreview';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';

interface CalloutContributionPreviewWhiteboardProps extends CalloutContributionPreviewComponentProps {}

const CalloutContributionPreviewWhiteboard = ({
  contribution,
  onOpenContribution,
}: CalloutContributionPreviewWhiteboardProps) => {
  return <WhiteboardPreview whiteboard={contribution?.whiteboard} onClick={onOpenContribution} seamless />;
};

export default CalloutContributionPreviewWhiteboard;
