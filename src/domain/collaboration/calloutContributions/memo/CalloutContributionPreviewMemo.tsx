import { gutters } from '@/core/ui/grid/utils';
import { Box } from '@mui/material';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import Loading from '@/core/ui/loading/Loading';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';
import useMemoManager from '@/domain/collaboration/memo/MemoManager/useMemoManager';

interface CalloutContributionPreviewMemoProps extends CalloutContributionPreviewComponentProps {}

const CalloutContributionPreviewMemo = ({
  contribution,
  loading,
  onOpenContribution,
}: CalloutContributionPreviewMemoProps) => {
  const memoId = contribution?.memo?.id;
  const { memo } = useMemoManager({ id: memoId });

  // Use the memo from the query if it has markdown, otherwise use the contribution's memo
  const displayMemo = memo?.markdown ? { markdown: memo.markdown } : contribution?.memo;

  return (
    <Box padding={gutters()} margin={gutters(-1)}>
      {loading ? (
        <Loading />
      ) : (
        <MemoPreview memo={displayMemo} onClick={onOpenContribution} sx={{ height: gutters(13) }} />
      )}
    </Box>
  );
};

export default CalloutContributionPreviewMemo;
