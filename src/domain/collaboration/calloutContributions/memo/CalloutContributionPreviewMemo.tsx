import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';

interface CalloutContributionPreviewMemoProps extends CalloutContributionPreviewComponentProps {}

const CalloutContributionPreviewMemo = ({ contribution, onOpenContribution }: CalloutContributionPreviewMemoProps) => {
  return (
    <Box padding={gutters()} margin={gutters(-1)}>
      <MemoPreview memo={contribution?.memo} onClick={onOpenContribution} />
    </Box>
  );
};

export default CalloutContributionPreviewMemo;
