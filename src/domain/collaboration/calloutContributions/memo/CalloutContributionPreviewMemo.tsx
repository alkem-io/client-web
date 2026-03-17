import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import useMemoManager from '@/domain/collaboration/memo/MemoManager/useMemoManager';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';
import type { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';

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

  return loading ? (
    <Loading />
  ) : (
    <MemoPreview memo={displayMemo} onClick={onOpenContribution} sx={{ height: gutters(16) }} seamless={true} />
  );
};

export default CalloutContributionPreviewMemo;
