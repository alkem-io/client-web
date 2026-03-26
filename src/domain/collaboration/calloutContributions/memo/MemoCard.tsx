import CardHeader from '@/core/ui/card/CardHeader';
import ContributeCard from '@/core/ui/card/ContributeCard';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { formatDate } from '@/core/utils/time/utils';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';
import type { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';

interface MemoCardProps extends CalloutContributionCardComponentProps {}

const MemoCard = ({ contribution, columns, callout, onClick, selected }: MemoCardProps) => {
  const memo = contribution?.memo;

  const linkState = (() => {
    return {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
  })();

  return (
    <ContributeCard to={memo?.profile.url} onClick={onClick} state={linkState} columns={columns}>
      <CardHeader title={memo?.profile.displayName} contrast={selected} author={memo?.createdBy}>
        {memo?.createdDate && <Caption color="textPrimary">{formatDate(memo?.createdDate)}</Caption>}
      </CardHeader>
      <MemoPreview
        memo={memo}
        displayName={memo?.profile.displayName}
        seamless={true}
        sx={{
          height: gutters(4),
          margin: 0,
          backgroundColor: theme => theme.palette.background.default,
          borderRadius: 0,
        }}
      />
    </ContributeCard>
  );
};

export default MemoCard;
