import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import WhiteboardPreview from '../../whiteboard/WhiteboardPreview/WhiteboardPreview';
import { CalloutContributionPreviewComponentProps } from '../calloutContributionPreview/CalloutContributionPreview';

interface CalloutContributionPreviewWhiteboardProps extends CalloutContributionPreviewComponentProps { }

const CalloutContributionPreviewWhiteboard = ({ contribution, onOpenContribution, loading }: CalloutContributionPreviewWhiteboardProps) => {

  return (
    <Box padding={gutters()} margin={gutters(-1)}>
      <WhiteboardPreview
        whiteboard={contribution?.whiteboard}
        onClick={onOpenContribution}
        /*onClose={() => setContributionDialogOpen(false)}*/
      />
    </Box>
  );
}

export default CalloutContributionPreviewWhiteboard;
