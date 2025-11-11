import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import Loading from '@/core/ui/loading/Loading';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';

interface CalloutContributionPreviewMemoProps extends CalloutContributionPreviewComponentProps {}

const CalloutContributionPreviewMemo = ({
  contribution,
  loading,
  onOpenContribution,
}: CalloutContributionPreviewMemoProps) => {
  return (
    <Box padding={gutters()} margin={gutters(-1)}>
      {loading ? (
        <Loading />
      ) : (
        <MemoPreview memo={contribution?.memo} onClick={onOpenContribution} sx={{ height: gutters(13) }} />
      )}
    </Box>
  );
};

export default CalloutContributionPreviewMemo;
