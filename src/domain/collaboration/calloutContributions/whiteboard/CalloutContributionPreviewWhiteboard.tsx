import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import WhiteboardPreview from '../../whiteboard/WhiteboardPreview/WhiteboardPreview';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';

interface CalloutContributionPreviewWhiteboardProps extends CalloutContributionPreviewComponentProps {}

const CalloutContributionPreviewWhiteboard = ({
  contribution,
  onOpenContribution,
}: CalloutContributionPreviewWhiteboardProps) => {
  return (
    <Box padding={gutters()} margin={gutters(-1)}>
      <WhiteboardPreview whiteboard={contribution?.whiteboard} onClick={onOpenContribution} />
    </Box>
  );
};

export default CalloutContributionPreviewWhiteboard;
